import { NextRequest } from 'next/server';
import { createSecureResponse, createErrorResponse, handleOptions } from '@/lib/security/api-helpers';

/**
 * Services API endpoint
 * This endpoint returns service information or redirects to appropriate resources
 */
export async function GET(request: NextRequest) {
  try {
    // For now, return a simple response
    // In the future, this could return service listings from the database
    const data = {
      services: [],
      message: 'Services endpoint - to be implemented',
    };
    
    return createSecureResponse({ success: true, data }, request);
  } catch (error: any) {
    return createErrorResponse(error, request, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

