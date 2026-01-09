import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { WORKFLOW_TEMPLATES } from "@/lib/workflows/definitions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET - Get workflow definition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    // Check if it's a template ID
    const template = WORKFLOW_TEMPLATES[id as keyof typeof WORKFLOW_TEMPLATES];
    if (template) {
      return NextResponse.json({
        success: true,
        data: {
          ...template,
          id,
        },
      });
    }

    // TODO: Load custom workflow from database
    return NextResponse.json({
      success: false,
      error: "Workflow not found",
    });
  } catch (error: any) {
    console.error("Failed to fetch workflow:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}







