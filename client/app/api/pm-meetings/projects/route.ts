import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const bindVars = {
      p_user_id: Number(userId),
      p_projects_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_projects_cursor: any[];
    }>(`BEGIN get_pm_projects_for_scheduling(:p_user_id, :p_projects_cursor); END;`, bindVars);

    if (result && result.p_projects_cursor) {
      return NextResponse.json(result.p_projects_cursor);
    } else {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching projects for scheduling:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
