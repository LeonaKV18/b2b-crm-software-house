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
      p_tasks_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_tasks_cursor: any[]; // Adjust type based on actual cursor content
    }>(`BEGIN get_developer_tasks(:p_user_id, :p_tasks_cursor); END;`, bindVars);

    if (result && result.p_tasks_cursor) {
      // Assuming the cursor returns an array of task objects
      return NextResponse.json(result.p_tasks_cursor);
    } else {
      return NextResponse.json({ error: "No tasks found for this developer" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching developer tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
