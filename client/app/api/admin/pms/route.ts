import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_pms_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_pms_cursor: any[];
    }>(`BEGIN get_available_pms(:p_pms_cursor); END;`, bindVars);

    if (result && result.p_pms_cursor) {
      return NextResponse.json(result.p_pms_cursor);
    } else {
      return NextResponse.json({ error: "Failed to fetch PMs" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching PMs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
