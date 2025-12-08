import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    // Basic server-side validation
    if (!name || !email || !password || !role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (role !== 'pm' && role !== 'developer') {
        return NextResponse.json({ error: "Invalid role. Must be 'pm' or 'developer'" }, { status: 400 });
    }

    const bindVars = {
      p_email: email,
      p_name: name,
      p_password: password,
      p_role: role,
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
    };

    const result = await executeQuery<{
      p_success: number;
      p_message: string;
    }>(`BEGIN create_employee(:p_email, :p_name, :p_password, :p_role, :p_success, :p_message); END;`, bindVars);

    if (result && result.p_success === 1) {
      return NextResponse.json({ success: true, message: result.p_message });
    } else {
      return NextResponse.json({ error: result?.p_message || "Failed to create employee" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
