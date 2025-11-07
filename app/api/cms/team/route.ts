import { NextRequest, NextResponse } from 'next/server';
import { teamMembers } from '@/lib/cms/api';
import { TeamMemberSchema } from '@/lib/cms/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const data = teamMembers.getAll(published);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TeamMemberSchema.parse(body);
    
    const result = teamMembers.create(validated);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create team member' }, { status: 500 });
  }
}





