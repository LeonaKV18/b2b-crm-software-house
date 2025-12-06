import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_on_time_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_at_risk_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_delayed_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_on_time_count: number;
      p_at_risk_count: number;
      p_delayed_count: number;
    }>(`BEGIN get_admin_project_status(:p_on_time_count, :p_at_risk_count, :p_delayed_count); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        onTimeCount: result.p_on_time_count,
        atRiskCount: result.p_at_risk_count,
        delayedCount: result.p_delayed_count,
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch admin project status" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching admin project status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
