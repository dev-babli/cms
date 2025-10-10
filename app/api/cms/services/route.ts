import { NextRequest, NextResponse } from 'next/server';
import { services } from '@/lib/cms/api';
import { ServiceSchema } from '@/lib/cms/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';
    
    const data = services.getAll(published);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ServiceSchema.parse(body);
    
    const result = services.create(validated);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create service' }, { status: 500 });
  }
}



