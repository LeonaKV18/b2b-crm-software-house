import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';
import { UserRole } from "@/lib/auth-context";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();
    console.log("Login attempt for:", { email, role });

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
    }

    const bindVars = {
      p_email: email,
      p_password: password,
      p_user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_role: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
      p_name: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
      p_is_valid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{
      p_user_id: number;
      p_role: string;
      p_name: string;
      p_is_valid: number;
    }>(`BEGIN verify_user(:p_email, :p_password, :p_user_id, :p_role, :p_name, :p_is_valid); END;`, bindVars);

    const { p_user_id, p_role, p_name, p_is_valid } = result; // outBinds are directly returned from executeQuery

    if (p_is_valid === 1) {
      const user = {
        id: p_user_id.toString(),
        email: email,
        name: p_name,
        role: p_role as UserRole,
        company: p_role === "client" ? "Acme Corp" : "TechHouse", // Placeholder for company
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      console.log("Login successful, returning user:", user);
      return NextResponse.json(user);
    } else {
      console.log("Login failed: Invalid credentials or user not found.");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}