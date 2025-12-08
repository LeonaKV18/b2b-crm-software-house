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
      p_active_projects_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_delayed_projects_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_on_schedule_projects_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_team_utilization: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_completed_projects_count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_milestones_on_time: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_milestones_delayed: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_active_projects_count: number;
      p_delayed_projects_count: number;
      p_on_schedule_projects_count: number;
      p_team_utilization: number;
      p_completed_projects_count: number;
      p_milestones_on_time: number;
      p_milestones_delayed: number;
    }>(`BEGIN get_pm_dashboard_stats(:p_user_id, :p_active_projects_count, :p_delayed_projects_count, :p_on_schedule_projects_count, :p_team_utilization, :p_completed_projects_count, :p_milestones_on_time, :p_milestones_delayed); END;`, bindVars);

    if (result) {
      return NextResponse.json({
        activeProjectsCount: result.p_active_projects_count,
        delayedProjectsCount: result.p_delayed_projects_count,
        onScheduleProjectsCount: result.p_on_schedule_projects_count,
        teamUtilization: result.p_team_utilization,
        completedProjectsCount: result.p_completed_projects_count,
        milestonesOnTime: result.p_milestones_on_time,
        milestonesDelayed: result.p_milestones_delayed
      });
    } else {
      return NextResponse.json({ error: "Failed to fetch PM dashboard stats" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching PM dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}