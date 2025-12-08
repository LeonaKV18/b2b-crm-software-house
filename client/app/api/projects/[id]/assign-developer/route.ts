import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = id;
    const body = await req.json();
    const { developerId } = body;

    if (!projectId || !developerId) {
      return NextResponse.json({ error: "Project ID and Developer ID are required" }, { status: 400 });
    }

    const bindVars = {
      p_project_id: Number(projectId),
      p_developer_id: Number(developerId),
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{ p_success: number }>(
      `BEGIN assign_dev_to_proj_tasks(:p_project_id, :p_developer_id, :p_success); END;`,
      bindVars
    );

    if (result && result.p_success === 1) {
      return NextResponse.json({ message: "Developer assigned to project tasks successfully" });
    } else {
      return NextResponse.json({ error: "Failed to assign developer to project tasks" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error assigning developer to project tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
