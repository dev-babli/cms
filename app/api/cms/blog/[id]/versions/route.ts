import { NextRequest, NextResponse } from 'next/server';
import { versioning } from '@/lib/cms/versioning';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const versions = versioning.getVersions('blog_post', id);
    
    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();
    
    const result = versioning.saveVersion(
      'blog_post',
      id,
      body.content,
      body.changedBy,
      body.description
    );
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save version' }, { status: 500 });
  }
}



