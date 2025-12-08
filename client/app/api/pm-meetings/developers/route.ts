import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const bindVars = {
      p_project_id: Number(projectId),
      p_developers_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_developers_cursor: any[];
    }>(`BEGIN get_project_developers(:p_project_id, :p_developers_cursor); END;`, bindVars);

    if (result && result.p_developers_cursor) {
      const developers = result.p_developers_cursor.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email
      }));
      return NextResponse.json(developers);
    } else {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching project developers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
