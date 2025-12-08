import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_clients_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_clients_cursor: any[]; // Adjust type based on actual cursor content
    }>(`BEGIN get_all_clients(:p_clients_cursor); END;`, bindVars);

    if (result && result.p_clients_cursor) {
      // Assuming the cursor returns an array of client objects
      return NextResponse.json(result.p_clients_cursor);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
