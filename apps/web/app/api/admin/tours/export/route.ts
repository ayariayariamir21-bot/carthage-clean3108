import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { dbTourRepository } from "@/lib/tours/repository";
import { toToursCsv } from "@/lib/tours/query";

const FILTER_KEYS = [
  "date",
  "dateFrom",
  "dateTo",
  "zoneId",
  "zoneCode",
  "status",
  "agent",
  "creatorId",
] as const;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
    return new Response("Forbidden", { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const filters: Record<string, string | undefined> = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key)?.trim();
    if (value) filters[key] = value;
  }

  const result = await dbTourRepository.queryTours({
    filters,
    pageSize: 100000,
  });

  const csv = toToursCsv(result.rows);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tours.csv"',
    },
  });
}
