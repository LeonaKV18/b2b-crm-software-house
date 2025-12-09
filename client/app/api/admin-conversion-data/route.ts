import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_proposals_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_approved_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_rejected_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_proposals_count: number;
      p_approved_count: number;
      p_rejected_count: number;
    }>(`BEGIN get_admin_conversion_data(:p_proposals_count, :p_approved_count, :p_rejected_count); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        proposalsCount: result.p_proposals_count,
        approvedCount: result.p_approved_count,
        rejectedCount: result.p_rejected_count,
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch admin conversion data" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching admin conversion data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
