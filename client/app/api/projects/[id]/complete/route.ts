import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = id;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const bindVars = {
      p_proposal_id: Number(projectId),
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{ p_success: number }>(
      `BEGIN complete_project(:p_proposal_id, :p_success); END;`,
      bindVars
    );

    if (result && result.p_success === 1) {
      return NextResponse.json({ message: "Project completed and invoice generated" });
    } else {
      return NextResponse.json({ error: "Failed to complete project" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error completing project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
