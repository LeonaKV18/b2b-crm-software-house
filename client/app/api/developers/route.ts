import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_developers_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_developers_cursor: any[];
    }>(`BEGIN get_available_developers(:p_developers_cursor); END;`, bindVars);

    if (result && result.p_developers_cursor) {
      const developers = result.p_developers_cursor.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
      }));
      return NextResponse.json(developers);
    } else {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching available developers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
