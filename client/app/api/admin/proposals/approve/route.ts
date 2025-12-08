import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const { proposalId, comment } = await req.json();

    const bindVars = {
      p_proposal_id: proposalId,
      p_comment: comment || '',
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_success: number;
    }>(`BEGIN approve_proposal(:p_proposal_id, :p_comment, :p_success); END;`, bindVars);

    if (result && result.p_success === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to approve proposal" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error approving proposal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
