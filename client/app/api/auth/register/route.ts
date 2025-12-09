import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, phone, password } = body;

    if (!name || !company || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bindVars = {
      p_name: name, // User name
      p_company: company,
      p_contact_name: name, // For signup, we assume the user is the primary contact
      p_email: email,
      p_phone: phone || '',
      p_password: password,
      p_status: 'Active',
      p_client_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
    };

    const result = await executeQuery<{
      p_client_id: number;
      p_success: number;
      p_message: string;
    }>(`BEGIN create_client(:p_name, :p_company, :p_contact_name, :p_email, :p_phone, :p_password, :p_status, :p_client_id, :p_success, :p_message); END;`, bindVars);

    if (result && result.p_success === 1) {
      return NextResponse.json({ success: true, clientId: result.p_client_id }, { status: 201 });
    } else {
      return NextResponse.json({ error: result?.p_message || "Failed to create account" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating client account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
