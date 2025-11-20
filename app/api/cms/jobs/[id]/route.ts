import { NextRequest, NextResponse } from 'next/server';
import { jobPostings } from '@/lib/cms/api';
import { JobPostingSchema } from '@/lib/cms/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
    const { id } = await params;
    const jobId = parseInt(id);
    const allJobs = jobPostings.getAll(false);
    const job = allJobs.find((item: any) => item.id === jobId);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job posting not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, data: job }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job posting' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    const body = await request.json();
    const validated = JobPostingSchema.partial().parse(body);

    const result = jobPostings.update(jobId, validated);
    return NextResponse.json({ success: true, data: result }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update job posting' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    const result = jobPostings.delete(jobId);
    return NextResponse.json({ success: true, data: result }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete job posting' },
      { status: 500, headers: corsHeaders }
    );
  }
}

