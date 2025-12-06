import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_total_revenue: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_active_clients: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_conversion_rate: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_team_utilization: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_total_revenue: number;
      p_active_clients: number;
      p_conversion_rate: number;
      p_team_utilization: number;
    }>(`BEGIN get_admin_summary_metrics(:p_total_revenue, :p_active_clients, :p_conversion_rate, :p_team_utilization); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        totalRevenue: result.p_total_revenue,
        activeClients: result.p_active_clients,
        conversionRate: result.p_conversion_rate,
        teamUtilization: result.p_team_utilization,
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch admin summary metrics" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching admin summary metrics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
