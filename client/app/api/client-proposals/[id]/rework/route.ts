import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const proposalId = id;
    const body = await req.json();
    const { title, description, value, expectedClose } = body;

    if (!proposalId || !title || !value) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bindVars = {
      p_proposal_id: Number(proposalId),
      p_title: title,
      p_description: description || '',
      p_value: Number(value),
      p_expected_close: expectedClose ? new Date(expectedClose) : null,
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{ p_success: number }>(
      `BEGIN rework_proposal(:p_proposal_id, :p_title, :p_description, :p_value, :p_expected_close, :p_success); END;`,
      bindVars
    );

    if (result && result.p_success === 1) {
      return NextResponse.json({ message: "Proposal reworked successfully" });
    } else {
      return NextResponse.json({ error: "Failed to rework proposal" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error reworking proposal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
