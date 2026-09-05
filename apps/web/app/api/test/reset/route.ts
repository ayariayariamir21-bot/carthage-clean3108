import { NextResponse } from "next/server";
import { resetTestDatabaseFromApi } from "@/lib/test/reset";

export const dynamic = "force-dynamic";

export async function POST() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl.includes("carthage_clean_test")) {
    return NextResponse.json({ error: "Forbidden: not a test DB" }, { status: 403 });
  }
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden: production" }, { status: 403 });
  }

  try {
    await resetTestDatabaseFromApi();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Allow GET for manual health check in test env
export async function GET() {
  return POST();
}
