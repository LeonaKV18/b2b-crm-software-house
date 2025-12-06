import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_meetings_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_meetings_cursor: any[]; // Adjust type based on actual cursor content
    }>(`BEGIN get_all_meetings(:p_meetings_cursor); END;`, bindVars);

    if (result && result.p_meetings_cursor) {
      // Assuming the cursor returns an array of meeting objects
      return NextResponse.json(result.p_meetings_cursor);
    } else {
      return NextResponse.json({ error: "No meetings found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
