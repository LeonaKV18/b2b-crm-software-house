import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_meetings_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_meetings_cursor: any[];
    }>(`BEGIN get_all_meetings(:p_meetings_cursor); END;`, bindVars);

    if (result && result.p_meetings_cursor) {
      // Map the result to match the frontend interface if needed,
      // but the procedure uses aliases that match fairly well.
      // SQL returns: id, title, date_str, time_str, attendees, type, location, mom
      const meetings = result.p_meetings_cursor.map((m: any) => ({
        id: m.ID,
        title: m.TITLE,
        date: m.DATE_STR,
        time: m.TIME_STR,
        attendees: m.ATTENDEES,
        type: m.TYPE,
        location: m.LOCATION,
        mom: m.MOM
      }));
      return NextResponse.json(meetings);
    } else {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposalId, subject, date, time, type, includeClient, userId } = body;

    // Combine date and time into a Date object or string for Oracle
    // Assuming date is YYYY-MM-DD and time is HH:MM
    const scheduledDate = new Date(`${date}T${time}:00`);

    const bindVars = {
      p_proposal_id: parseInt(proposalId, 10),
      p_creator_id: userId,
      p_subject: subject,
      p_scheduled_date: scheduledDate,
      p_meeting_type: type,
      p_include_client: includeClient ? 1 : 0,
      p_meeting_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    await executeQuery(
      `BEGIN create_meeting_custom(:p_proposal_id, :p_creator_id, :p_subject, :p_scheduled_date, :p_meeting_type, :p_include_client, :p_meeting_id); END;`,
      bindVars
    );

    return NextResponse.json({ message: "Meeting scheduled successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { meetingId, mom } = body;

        const bindVars = {
            p_meeting_id: meetingId,
            p_mom: mom,
            p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await executeQuery<{ p_success: number }>(
            `BEGIN update_meeting_mom(:p_meeting_id, :p_mom, :p_success); END;`,
            bindVars
        );

        if (result && result.p_success === 1) {
             return NextResponse.json({ message: "MoM updated successfully" });
        } else {
             return NextResponse.json({ error: "Failed to update MoM" }, { status: 400 });
        }

    } catch (error) {
        console.error("Error updating MoM:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}