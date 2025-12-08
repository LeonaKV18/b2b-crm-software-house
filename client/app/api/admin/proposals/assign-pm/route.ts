import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const { proposalId, pmUserId } = await req.json();

    const bindVars = {
      p_proposal_id: proposalId,
      p_pm_user_id: pmUserId,
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
    };

    const result = await executeQuery<{
      p_success: number;
      p_message: string;
    }>(`BEGIN assign_pm_to_proposal(:p_proposal_id, :p_pm_user_id, :p_success, :p_message); END;`, bindVars);

    if (result && result.p_success === 1) {
      return NextResponse.json({ success: true, message: result.p_message });
    } else {
      return NextResponse.json({ error: result?.p_message || "Failed to assign PM" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error assigning PM:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
