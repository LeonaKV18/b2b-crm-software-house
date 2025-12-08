import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = id;
    const body = await req.json();
    const { isActive } = body; // true/false or 1/0

    if (!userId || typeof isActive === 'undefined') {
      return NextResponse.json({ error: "User ID and isActive status are required" }, { status: 400 });
    }

    const bindVars = {
      p_user_id: Number(userId),
      p_is_active: isActive ? 1 : 0,
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{ p_success: number }>(
      `BEGIN update_user_status(:p_user_id, :p_is_active, :p_success); END;`,
      bindVars
    );

    if (result && result.p_success === 1) {
      return NextResponse.json({ message: "User status updated successfully" });
    } else {
      return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
