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
      p_total_leads: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_total_clients: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_total_proposals: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_conversion_rate: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_total_leads: number;
      p_total_clients: number;
      p_total_proposals: number;
      p_conversion_rate: number;
    }>(`BEGIN get_sales_dashboard_stats(:p_user_id, :p_total_leads, :p_total_clients, :p_total_proposals, :p_conversion_rate); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        totalLeads: result.p_total_leads,
        totalClients: result.p_total_clients,
        totalProposals: result.p_total_proposals,
        conversionRate: result.p_conversion_rate,
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch sales dashboard stats" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching sales dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
