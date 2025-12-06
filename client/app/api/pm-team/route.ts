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
      p_team_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_team_cursor: any[]; // Adjust type based on actual cursor content
    }>(`BEGIN get_pm_team(:p_user_id, :p_team_cursor); END;`, bindVars);

    if (result && result.p_team_cursor) {
      // Assuming the cursor returns an array of team member objects
      return NextResponse.json(result.p_team_cursor);
    } else {
      return NextResponse.json({ error: "No team members found for this PM" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching PM team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
