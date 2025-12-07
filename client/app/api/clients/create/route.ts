import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received client creation request:", body);
    const { name, company, contact, email, phone, password, status } = body;

    if (!name || !company || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bindVars = {
      p_name: name,
      p_company: company,
      p_contact_name: contact || name,
      p_email: email,
      p_phone: phone || '',
      p_password: password,
      p_status: status || 'Active',
      p_client_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_client_id: number;
    }>(`BEGIN create_client(:p_name, :p_company, :p_contact_name, :p_email, :p_phone, :p_password, :p_status, :p_client_id); END;`, bindVars);

    if (result && result.p_client_id) {
      return NextResponse.json({ success: true, clientId: result.p_client_id }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
