import { NextRequest, NextResponse } from 'next/server';
import { services } from '@/lib/cms/api';
import { ServiceSchema } from '@/lib/cms/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    // Get all services and find by ID
    const allServices = await services.getAll(false);
    const service = allServices.find((s: any) => s.id === id);
    
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    return NextResponse.json(
      { success: true, data: service },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    const validated = ServiceSchema.partial().parse(body);
    
    const result = await services.update(id, validated);
    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const result = await services.delete(id);
    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

