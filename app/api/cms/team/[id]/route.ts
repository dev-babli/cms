import { NextRequest, NextResponse } from 'next/server';
import { teamMembers } from '@/lib/cms/api';
import { TeamMemberSchema } from '@/lib/cms/types';

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
    
    // Get all members and find by ID
    const allMembers = await teamMembers.getAll(false);
    const member = allMembers.find((m: any) => m.id === id);
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    return NextResponse.json(
      { success: true, data: member },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team member' },
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
    const validated = TeamMemberSchema.partial().parse(body);
    
    const result = await teamMembers.update(id, validated);
    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
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
    const result = await teamMembers.delete(id);
    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete team member' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

