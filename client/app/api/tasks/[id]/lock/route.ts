import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const taskId = id;
    const body = await req.json();
    const { userId } = body;

    if (!taskId || !userId) {
      return NextResponse.json({ error: "Task ID and User ID are required" }, { status: 400 });
    }

    const bindVars = {
      p_task_id: Number(taskId),
      p_user_id: Number(userId),
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
    };

    const result = await executeQuery<{ p_success: number; p_message: string }>(
      `BEGIN lock_task(:p_task_id, :p_user_id, :p_success, :p_message); END;`,
      bindVars
    );

    if (result && result.p_success === 1) {
      return NextResponse.json({ message: result.p_message });
    } else {
      return NextResponse.json({ error: result?.p_message || "Failed to lock task" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error locking task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
