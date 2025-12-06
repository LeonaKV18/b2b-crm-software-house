import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_team_members_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_team_members_cursor: any[]; // Adjust type based on actual cursor content
    }>(`BEGIN get_all_team_members(:p_team_members_cursor); END;`, bindVars);

    if (result && result.p_team_members_cursor) {
      // Assuming the cursor returns an array of team member objects
      return NextResponse.json(result.p_team_members_cursor);
    } else {
      return NextResponse.json({ error: "No team members found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
