import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from "oracledb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposalId, taskId, description, fee, dueDate } = body;

    if (!proposalId || !description || !fee || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const bindVars = {
      p_proposal_id: Number(proposalId),
      p_task_id: taskId ? Number(taskId) : null,
      p_description: description,
      p_fee: Number(fee),
      p_due_date: new Date(dueDate),
    };

    await executeQuery(
      `BEGIN create_milestone(:p_proposal_id, :p_task_id, :p_description, :p_fee, :p_due_date); END;`,
      bindVars
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
