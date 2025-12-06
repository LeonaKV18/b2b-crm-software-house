import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_total_clients: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_active_projects: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_pending_proposals: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_active_users: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_total_clients: number;
      p_active_projects: number;
      p_pending_proposals: number;
      p_active_users: number;
    }>(`BEGIN get_admin_dashboard_stats(:p_total_clients, :p_active_projects, :p_pending_proposals, :p_active_users); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        totalClients: result.p_total_clients,
        activeProjects: result.p_active_projects,
        pendingProposals: result.p_pending_proposals,
        activeUsers: result.p_active_users,
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch admin dashboard stats" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
