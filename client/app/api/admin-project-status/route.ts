import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_on_track_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_not_on_time_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_on_track_count: number;
      p_not_on_time_count: number;
    }>(`BEGIN get_admin_project_status(:p_on_track_count, :p_not_on_time_count); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        onTrackCount: result.p_on_track_count,
        notOnTimeCount: result.p_not_on_time_count,
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch admin project status" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching admin project status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
