import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { dbTourRepository } from "@/lib/tours/repository";
import { generateCsvHeader, rowToCsvLine } from "@/lib/tours/query";

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

// Configuration
const EXPORT_PAGE_SIZE = 500;
const MAX_EXPORT_ROWS = 10000;

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

  // Create a readable stream for CSV output
  const stream = new ReadableStream({
    async start(controller) {
      // Send header
      controller.enqueue(new TextEncoder().encode(generateCsvHeader() + "\r\n"));

      let totalExported = 0;
      let page = 1;
      let hasMore = true;

      while (hasMore && totalExported < MAX_EXPORT_ROWS) {
        const remaining = MAX_EXPORT_ROWS - totalExported;
        const currentPageSize = Math.min(EXPORT_PAGE_SIZE, remaining);

        const result = await dbTourRepository.queryTours({
          filters,
          page,
          pageSize: currentPageSize,
          sort: { column: "date", direction: "asc" },
        });

        if (result.rows.length === 0) {
          hasMore = false;
          break;
        }

        for (const row of result.rows) {
          controller.enqueue(new TextEncoder().encode(rowToCsvLine(row) + "\r\n"));
          totalExported++;
        }

        if (result.rows.length < currentPageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }

      if (totalExported >= MAX_EXPORT_ROWS) {
        controller.enqueue(
          new TextEncoder().encode(
            `\r\n# Export truncated at ${MAX_EXPORT_ROWS} rows. Apply filters to reduce result set.\r\n`,
          ),
        );
      }

      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tours.csv"',
    },
  });
}
