import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposalId, creatorId, subject, scheduledDate, meetingType, developerIds, includeClient } = body;

    if (!proposalId || !creatorId || !subject || !scheduledDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert array of IDs to comma-separated string
    const devIdsString = Array.isArray(developerIds) ? developerIds.join(',') : '';

    const bindVars = {
      p_proposal_id: Number(proposalId),
      p_creator_id: Number(creatorId),
      p_subject: subject,
      p_scheduled_date: new Date(scheduledDate),
      p_meeting_type: meetingType || 'scrum',
      p_developer_ids: devIdsString,
      p_include_client: includeClient ? 1 : 0,
      p_meeting_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_meeting_id: number;
    }>(`BEGIN create_pm_meeting(:p_proposal_id, :p_creator_id, :p_subject, :p_scheduled_date, :p_meeting_type, :p_developer_ids, :p_include_client, :p_meeting_id); END;`, bindVars);

    if (result && result.p_meeting_id) {
      return NextResponse.json({ success: true, meetingId: result.p_meeting_id }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
