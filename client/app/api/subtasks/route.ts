import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentTaskId = searchParams.get('parentTaskId');

    if (!parentTaskId) {
      return NextResponse.json({ error: "Parent Task ID is required" }, { status: 400 });
    }

    const bindVars = {
      p_parent_task_id: Number(parentTaskId),
      p_subtasks_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_subtasks_cursor: any[];
    }>(`BEGIN get_subtasks(:p_parent_task_id, :p_subtasks_cursor); END;`, bindVars);

    if (result && result.p_subtasks_cursor) {
      return NextResponse.json(result.p_subtasks_cursor);
    } else {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
