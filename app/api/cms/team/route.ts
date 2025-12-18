import { NextRequest, NextResponse } from 'next/server';
import { teamMembers } from '@/lib/cms/api';
import { TeamMemberSchema } from '@/lib/cms/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const data = await teamMembers.getAll(published);
    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Clean up empty strings - convert to undefined for optional fields
    const cleanedBody = {
      ...body,
      position: body.position?.trim() || undefined,
      qualification: body.qualification?.trim() || undefined,
      bio: body.bio?.trim() || undefined,
      email: body.email?.trim() || undefined,
      linkedin: body.linkedin?.trim() || undefined,
      twitter: body.twitter?.trim() || undefined,
      image: body.image?.trim() || undefined,
    };
    
    const validated = TeamMemberSchema.parse(cleanedBody);
    
    const result = await teamMembers.create(validated);
    return NextResponse.json(
      { success: true, data: result },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error: any) {
    console.error('Error creating team member:', error);
    
    // Handle Zod validation errors
    if (error?.issues) {
      const validationErrors = error.issues.map((issue: any) => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');
      return NextResponse.json(
        { 
          success: false, 
          error: `Validation failed: ${validationErrors}`,
          details: process.env.NODE_ENV === 'development' ? error.issues : undefined
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    const errorMessage = error?.message || 'Failed to create team member';
    const errorDetails = process.env.NODE_ENV === 'development' ? {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint
    } : undefined;
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}





