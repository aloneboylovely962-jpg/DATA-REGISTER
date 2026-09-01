import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

const BUSINESS_CODE = "RFC-MGS";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT t.id, t.transaction_type, t.amount, t.category, t.reference, t.note,
              t.transaction_date, t.affects_profit,
              fa.name AS from_account, ta.name AS to_account
       FROM transactions t
       LEFT JOIN accounts fa ON fa.id = t.from_account_id
       LEFT JOIN accounts ta ON ta.id = t.to_account_id
       JOIN businesses b ON b.id = t.business_id
       WHERE b.code = $1
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT 100`,
      [BUSINESS_CODE]
    );
    return NextResponse.json({ ok: true, transactions: result.rows });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Database error" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = String(body.transactionType || "").toUpperCase();
    const amount = Number(body.amount);
    const date = String(body.date || "").trim();
    const category = String(body.category || "").trim() || null;
    const reference = String(body.reference || "").trim() || null;
    const note = String(body.note || "").trim() || null;
    const fromAccountId = body.fromAccountId || null;
    const toAccountId = body.toAccountId || null;

    if (!["INCOME", "EXPENSE", "TRANSFER", "ADJUSTMENT"].includes(type)) {
      return NextResponse.json({ ok: false, message: "Invalid transaction type" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ ok: false, message: "Amount must be greater than zero" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ ok: false, message: "Transaction date is required" }, { status: 400 });
    }
    if (!fromAccountId && !toAccountId) {
      return NextResponse.json({ ok: false, message: "Select an account" }, { status: 400 });
    }
    if (type === "INCOME" && !toAccountId) {
      return NextResponse.json({ ok: false, message: "Income needs a destination account" }, { status: 400 });
    }
    if (type === "EXPENSE" && !fromAccountId) {
      return NextResponse.json({ ok: false, message: "Expense needs a source account" }, { status: 400 });
    }
    if (type === "TRANSFER" && (!fromAccountId || !toAccountId || fromAccountId === toAccountId)) {
      return NextResponse.json({ ok: false, message: "Transfer needs different source and destination accounts" }, { status: 400 });
    }

    const business = await pool.query(`SELECT id FROM businesses WHERE code = $1`, [BUSINESS_CODE]);
    if (!business.rows[0]) {
      return NextResponse.json({ ok: false, message: "Business is not configured" }, { status: 500 });
    }

    const profitImpact = type !== "TRANSFER";
    const result = await pool.query(
      `INSERT INTO transactions
       (business_id, transaction_type, amount, from_account_id, to_account_id,
        affects_profit, category, reference, note, transaction_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, transaction_type, amount, transaction_date`,
      [business.rows[0].id, type, amount, fromAccountId, toAccountId, profitImpact, category, reference, note, date]
    );

    return NextResponse.json({ ok: true, transaction: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Database error" },
      { status: 503 }
    );
  }
}
