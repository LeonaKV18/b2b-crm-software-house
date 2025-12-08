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
      p_meetings_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    // Reusing get_developer_meetings as it is generic for any user ID in meeting_participants
    const result = await executeQuery<{
      p_meetings_cursor: any[];
    }>(`BEGIN get_developer_meetings(:p_user_id, :p_meetings_cursor); END;`, bindVars);

    if (result && result.p_meetings_cursor) {
      return NextResponse.json(result.p_meetings_cursor);
    } else {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching client meetings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
