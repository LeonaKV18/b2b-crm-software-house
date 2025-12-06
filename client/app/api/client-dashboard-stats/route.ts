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
      p_proposals_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_active_projects_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_completed_projects_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_total_spent: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_proposals_count: number;
      p_active_projects_count: number;
      p_completed_projects_count: number;
      p_total_spent: number;
    }>(`BEGIN get_client_dashboard_stats(:p_user_id, :p_proposals_count, :p_active_projects_count, :p_completed_projects_count, :p_total_spent); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        proposalsCount: result.p_proposals_count,
        activeProjectsCount: result.p_active_projects_count,
        completedProjectsCount: result.p_completed_projects_count,
        totalSpent: result.p_total_spent,
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch client dashboard stats" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching client dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
