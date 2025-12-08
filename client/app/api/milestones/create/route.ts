import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, title, description, dueDate, priority } = body;

    if (!projectId || !title || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bindVars = {
      p_proposal_id: Number(projectId),
      p_title: title,
      p_description: description || '',
      p_due_date: new Date(dueDate),
      p_priority: priority || 'Medium',
      p_task_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_task_id: number;
    }>(`BEGIN create_task(:p_proposal_id, :p_title, :p_description, :p_due_date, :p_priority, :p_task_id); END;`, bindVars);

    if (result && result.p_task_id) {
      return NextResponse.json({ success: true, taskId: result.p_task_id }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
