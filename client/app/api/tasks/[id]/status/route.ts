import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const taskId = id;
    const body = await req.json();
    const { status } = body;

    if (!taskId || !status) {
      return NextResponse.json({ error: "Task ID and Status are required" }, { status: 400 });
    }

    const bindVars = {
      p_task_id: Number(taskId),
      p_status: status,
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{ p_success: number }>(
      `BEGIN review_task(:p_task_id, :p_status, :p_success); END;`,
      bindVars
    );

    if (result && result.p_success === 1) {
      return NextResponse.json({ message: "Task status updated successfully" });
    } else {
      return NextResponse.json({ error: "Failed to update task status" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
