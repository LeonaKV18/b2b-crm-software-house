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
      p_milestones_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_milestones_cursor: any[];
    }>(`BEGIN get_developer_milestones(:p_user_id, :p_milestones_cursor); END;`, bindVars);

    if (result && result.p_milestones_cursor) {
      return NextResponse.json(result.p_milestones_cursor);
    } else {
      return NextResponse.json({ error: "No milestones found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching developer milestones:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
