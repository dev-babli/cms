import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * On-demand revalidation endpoint
 * Call this after updating hero slides, addresses, or pages
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.REVALIDATE_SECRET}`;
    
    if (authHeader !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag parameter required' },
        { status: 400 }
      );
    }

    // Revalidate the cache tag
    revalidateTag(tag);

    return NextResponse.json({
      revalidated: true,
      tag,
      now: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}





