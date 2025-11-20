import { NextRequest, NextResponse } from 'next/server';
import { jobPostings } from '@/lib/cms/api';
import { JobPostingSchema } from '@/lib/cms/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';

    const data = jobPostings.getAll(published);
    return NextResponse.json({ success: true, data }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job postings' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = JobPostingSchema.parse(body);

    const result = jobPostings.create(validated);
    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create job posting' },
      { status: 500, headers: corsHeaders }
    );
  }
}

