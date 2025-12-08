import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      title, 
      description, 
      value, 
      expectedClose, 
      functionalReq, 
      nonFunctionalReq, 
      comments 
    } = body;

    if (!userId || !title || !value) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bindVars = {
      p_user_id: Number(userId),
      p_title: title,
      p_description: description || '',
      p_value: Number(value),
      p_expected_close: expectedClose ? new Date(expectedClose) : null,
      p_functional_req: functionalReq || '',
      p_non_functional_req: nonFunctionalReq || '',
      p_client_comments: comments || '',
      p_proposal_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_proposal_id: number;
    }>(`BEGIN create_client_proposal(
        :p_user_id, 
        :p_title, 
        :p_description, 
        :p_value, 
        :p_expected_close, 
        :p_functional_req, 
        :p_non_functional_req, 
        :p_client_comments, 
        :p_proposal_id
    ); END;`, bindVars);

    if (result && result.p_proposal_id) {
      return NextResponse.json({ success: true, proposalId: result.p_proposal_id }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating client proposal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}