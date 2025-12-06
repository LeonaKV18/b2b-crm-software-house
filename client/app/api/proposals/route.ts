import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_proposals_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_proposals_cursor: any[]; // Adjust type based on actual cursor content
    }>(`BEGIN get_all_proposals(:p_proposals_cursor); END;`, bindVars);

    if (result && result.p_proposals_cursor) {
      // Assuming the cursor returns an array of proposal objects
      return NextResponse.json(result.p_proposals_cursor);
    } else {
      return NextResponse.json({ error: "No proposals found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
