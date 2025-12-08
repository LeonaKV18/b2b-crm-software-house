import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoiceId = id;

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const bindVars = {
      p_invoice_id: Number(invoiceId),
      p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await executeQuery<{ p_success: number }>(
      `BEGIN mark_invoice_paid(:p_invoice_id, :p_success); END;`,
      bindVars
    );

    if (result && result.p_success === 1) {
      return NextResponse.json({ message: "Invoice marked as paid successfully" });
    } else {
      return NextResponse.json({ error: "Failed to mark invoice as paid" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error marking invoice paid:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
