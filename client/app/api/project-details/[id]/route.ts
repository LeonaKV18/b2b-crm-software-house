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
      p_project_details_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_project_details_cursor: any[];
    }>(`BEGIN get_project_details(:p_project_id, :p_project_details_cursor); END;`, bindVars);

    if (result && result.p_project_details_cursor && result.p_project_details_cursor.length > 0) {
      return NextResponse.json(result.p_project_details_cursor[0]); // Return the first (and only) row
    } else {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching project details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
