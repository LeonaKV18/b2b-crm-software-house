import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = id;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const bindVars = {
      p_project_id: Number(projectId),
      p_tasks_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_tasks_cursor: any[];
    }>(`BEGIN get_all_project_tasks(:p_project_id, :p_tasks_cursor); END;`, bindVars);

    if (result && result.p_tasks_cursor) {
      return NextResponse.json(result.p_tasks_cursor);
    } else {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
