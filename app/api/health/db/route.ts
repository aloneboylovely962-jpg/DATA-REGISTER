import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const result = await db.query("SELECT NOW() AS server_time");

    return NextResponse.json({
      ok: true,
      database: "connected",
      serverTime: result.rows[0]?.server_time ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database connection failed";

    return NextResponse.json(
      {
        ok: false,
        database: "not_connected",
        message,
      },
      { status: 503 },
    );
  }
}
