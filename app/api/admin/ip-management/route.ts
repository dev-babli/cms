import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { createErrorResponse, createSecureResponse } from '@/lib/security/api-helpers';
import { applyCorsHeaders } from '@/lib/security/cors';
import {
  getIPsByType,
  getIPRecord,
  addToWhitelist,
  addToBlacklist,
  removeIP,
} from '@/lib/security/ip-manager';
import { getLoginAttempts, getLoginAttemptStats } from '@/lib/security/login-attempts';
import { z } from 'zod';

// Only admins can access IP management
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    if (user.role !== 'admin') {
      return createErrorResponse('Admin access required', request, 403);
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'whitelist' | 'blacklist' | 'monitor' | null;
    const ip = searchParams.get('ip');
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Get IP records
    let ipRecords: any[] = [];
    if (type) {
      ipRecords = await getIPsByType(type);
    } else if (ip) {
      const record = await getIPRecord(ip);
      if (record) {
        ipRecords = [record];
      }
    } else {
      // Get all types
      const [whitelist, blacklist, monitor] = await Promise.all([
        getIPsByType('whitelist'),
        getIPsByType('blacklist'),
        getIPsByType('monitor'),
      ]);
      ipRecords = [...whitelist, ...blacklist, ...monitor];
    }
    
    // Get login attempts for each IP
    const ipRecordsWithAttempts = await Promise.all(
      ipRecords.map(async (record) => {
        const attempts = await getLoginAttempts({
          ip: record.ip,
          limit: 10,
        });
        const stats = await getLoginAttemptStats(record.ip);
        return {
          ...record,
          loginAttempts: attempts,
          loginStats: stats,
        };
      })
    );
    
    // Get login attempts if email filter is provided
    let loginAttempts = [];
    if (email) {
      loginAttempts = await getLoginAttempts({
        email,
        limit,
        offset,
      });
    } else {
      loginAttempts = await getLoginAttempts({
        limit,
        offset,
      });
    }
    
    // Get overall stats
    const overallStats = await getLoginAttemptStats();
    
    return createSecureResponse(
      {
        success: true,
        data: {
          ipRecords: ipRecordsWithAttempts,
          loginAttempts,
          stats: overallStats,
        },
      },
      request
    );
  } catch (error: any) {
    console.error('Failed to get IP management data:', error);
    return createErrorResponse(error, request, 500);
  }
}

const AddIPSchema = z.object({
  ip: z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'Invalid IP address'),
  type: z.enum(['whitelist', 'blacklist']),
  reason: z.string().optional(),
  expiresIn: z.number().optional(), // milliseconds
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    if (user.role !== 'admin') {
      return createErrorResponse('Admin access required', request, 403);
    }
    
    const body = await request.json();
    const validated = AddIPSchema.parse(body);
    
    if (validated.type === 'whitelist') {
      await addToWhitelist(validated.ip, validated.reason, validated.expiresIn);
    } else {
      await addToBlacklist(validated.ip, validated.reason, validated.expiresIn);
    }
    
    return createSecureResponse(
      {
        success: true,
        message: `IP ${validated.ip} added to ${validated.type}`,
      },
      request
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        `Validation failed: ${error.issues.map((i) => i.message).join(', ')}`,
        request,
        400
      );
    }
    console.error('Failed to add IP:', error);
    return createErrorResponse(error, request, 500);
  }
}

const RemoveIPSchema = z.object({
  // Accept any non-empty string for deletion - IPs in database may be IPv4, IPv6, or other formats
  // We're just removing by exact match, so strict validation isn't needed
  ip: z.string().min(1, 'IP address is required'),
});

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Authentication required', request, 401);
    }
    
    if (user.role !== 'admin') {
      return createErrorResponse('Admin access required', request, 403);
    }
    
    const body = await request.json();
    const validated = RemoveIPSchema.parse(body);
    
    await removeIP(validated.ip);
    
    return createSecureResponse(
      {
        success: true,
        message: `IP ${validated.ip} removed from management`,
      },
      request
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        `Validation failed: ${error.issues.map((i) => i.message).join(', ')}`,
        request,
        400
      );
    }
    console.error('Failed to remove IP:', error);
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return applyCorsHeaders(new NextResponse(null, { status: 204 }), request, {
    allowCredentials: true,
    allowedMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  });
}

