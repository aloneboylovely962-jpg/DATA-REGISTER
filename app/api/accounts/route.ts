import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT a.id, a.name, a.type, a.account_number, a.opening_balance
       FROM accounts a
       JOIN businesses b ON b.id = a.business_id
       WHERE b.code = $1 AND a.is_active = TRUE
       ORDER BY a.type, a.name`,
      ["RFC-MGS"]
    );
    return NextResponse.json({ ok: true, accounts: result.rows });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Database error" },
      { status: 503 }
    );
  }
}
