import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentTaskId, title, description, dueDate, priority } = body;

    if (!parentTaskId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bindVars = {
      p_parent_task_id: Number(parentTaskId),
      p_title: title,
      p_description: description || '',
      p_due_date: dueDate ? new Date(dueDate) : new Date(),
      p_priority: priority || 'Medium',
      p_subtask_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_subtask_id: number;
    }>(`BEGIN create_subtask(:p_parent_task_id, :p_title, :p_description, :p_due_date, :p_priority, :p_subtask_id); END;`, bindVars);

    if (result && result.p_subtask_id) {
      return NextResponse.json({ success: true, subtaskId: result.p_subtask_id }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
