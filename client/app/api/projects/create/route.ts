import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, title, description, value, deadline, status } = body;

    if (!clientId || !title || !value || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bindVars = {
      p_client_id: Number(clientId),
      p_title: title,
      p_description: description || '',
      p_value: Number(value),
      p_deadline: new Date(deadline), // Ensure date object
      p_status: status || 'active',
      p_proposal_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_proposal_id: number;
    }>(`BEGIN create_project(:p_client_id, :p_title, :p_description, :p_value, :p_deadline, :p_status, :p_proposal_id); END;`, bindVars);

    if (result && result.p_proposal_id) {
      return NextResponse.json({ success: true, projectId: result.p_proposal_id }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
