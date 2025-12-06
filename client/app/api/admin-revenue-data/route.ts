import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_revenue_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_revenue_cursor: any[];
    }>(`BEGIN get_admin_revenue_data(:p_revenue_cursor); END;`, bindVars);

    if (result && result.p_revenue_cursor) {
      return NextResponse.json(result.p_revenue_cursor);
    } else {
      return NextResponse.json({ error: "No revenue data found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching admin revenue data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
