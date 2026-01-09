import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET - List templates
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("type");

    let query = "SELECT * FROM content_templates WHERE 1=1";
    const params: any[] = [];

    if (contentType) {
      query += " AND content_type = $1";
      params.push(contentType);
    }

    query += " ORDER BY created_at DESC";

    const result = await db.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error: any) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create template
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { name, description, contentType, content } = body;

    if (!name || !contentType || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if table exists, create if not
    await db.query(`
      CREATE TABLE IF NOT EXISTS content_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        content_type VARCHAR(100) NOT NULL,
        content JSONB NOT NULL,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await db.query(
      `INSERT INTO content_templates (name, description, content_type, content, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, contentType, JSON.stringify(content), user.id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create template" },
      { status: 500 }
    );
  }
}







