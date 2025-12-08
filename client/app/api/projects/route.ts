import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_projects_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_projects_cursor: any[]; // Adjust type based on actual cursor content
    }>(`BEGIN get_all_projects(:p_projects_cursor); END;`, bindVars);

    if (result && result.p_projects_cursor) {
      // Assuming the cursor returns an array of project objects
      return NextResponse.json(result.p_projects_cursor);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
