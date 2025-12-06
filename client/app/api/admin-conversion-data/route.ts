import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_leads_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_proposals_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_approved_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_leads_count: number;
      p_proposals_count: number;
      p_approved_count: number;
    }>(`BEGIN get_admin_conversion_data(:p_leads_count, :p_proposals_count, :p_approved_count); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        leadsCount: result.p_leads_count,
        proposalsCount: result.p_proposals_count,
        approvedCount: result.p_approved_count,
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch admin conversion data" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching admin conversion data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
