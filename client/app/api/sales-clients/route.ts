import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const bindVars = {
      p_user_id: Number(userId),
      p_clients_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_clients_cursor: any[]; // Adjust type based on actual cursor content
    }>(`BEGIN get_sales_clients(:p_user_id, :p_clients_cursor); END;`, bindVars);

    if (result && result.p_clients_cursor) {
      // Assuming the cursor returns an array of client objects
      return NextResponse.json(result.p_clients_cursor);
    } else {
      return NextResponse.json({ error: "No clients found for this sales user" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching sales clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
