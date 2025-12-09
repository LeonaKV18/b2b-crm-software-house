import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from "oracledb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `BEGIN get_client_meetings(:p_user_id, :p_meetings_cursor); END;`,
      {
        p_user_id: Number(userId),
        p_meetings_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    if (result && Array.isArray(result)) {
        return NextResponse.json(result);
    } else {
        return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching client meetings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
