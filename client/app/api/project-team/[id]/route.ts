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
      p_team_members_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_team_members_cursor: any[];
    }>(`BEGIN get_project_team_members(:p_project_id, :p_team_members_cursor); END;`, bindVars);

    if (result && result.p_team_members_cursor) {
      return NextResponse.json(result.p_team_members_cursor);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching project team members:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
