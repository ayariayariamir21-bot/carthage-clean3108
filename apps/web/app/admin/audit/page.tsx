import Link from "next/link";
import { requireRolePage } from "@/lib/auth/guard";
import { dbAuditRepository } from "@/lib/audit/log";
import { formatDateTimeFr } from "@/lib/format";
import { AppShell } from "@/components/layout/AppShell";

const PAGE_SIZE = 20;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRolePage("admin");
  const params = await searchParams;

  const action = typeof params.action === "string" ? params.action : "";
  const entityType = typeof params.entityType === "string" ? params.entityType : "";
  const userEmail = typeof params.userEmail === "string" ? params.userEmail : "";
  const dateFrom = typeof params.dateFrom === "string" ? params.dateFrom : "";
  const dateTo = typeof params.dateTo === "string" ? params.dateTo : "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const { rows, total } = await dbAuditRepository.listAuditLogs(
    { action, entityType, userEmail, dateFrom, dateTo },
    page,
    PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const query = new URLSearchParams();
  if (action) query.set("action", action);
  if (entityType) query.set("entityType", entityType);
  if (userEmail) query.set("userEmail", userEmail);
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
  const baseQuery = query.toString();

  return (
    <AppShell user={user}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Piste d&apos;audit</h1>
          <p className="mt-1 text-slate-600">{total} entrée(s).</p>
        </div>
        <Link href="/admin" className="btn btn-secondary">
          Administration
        </Link>
      </div>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-card"
      >
        <div className="field mb-0">
          <label className="label" htmlFor="a-action">
            Action
          </label>
          <input
            id="a-action"
            name="action"
            defaultValue={action}
            className="input"
            style={{ minWidth: 160 }}
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="a-type">
            Type
          </label>
          <input
            id="a-type"
            name="entityType"
            defaultValue={entityType}
            className="input"
            style={{ minWidth: 140 }}
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="a-user">
            Utilisateur
          </label>
          <input
            id="a-user"
            name="userEmail"
            defaultValue={userEmail}
            placeholder="email"
            className="input"
            style={{ minWidth: 160 }}
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="a-from">
            Du
          </label>
          <input
            id="a-from"
            name="dateFrom"
            type="date"
            defaultValue={dateFrom}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="a-to">
            Au
          </label>
          <input id="a-to" name="dateTo" type="date" defaultValue={dateTo} className="input" />
        </div>
        <button type="submit" className="btn btn-primary">
          Filtrer
        </button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Date</th>
              <th className="th">Utilisateur</th>
              <th className="th">Action</th>
              <th className="th">Type</th>
              <th className="th">Cible</th>
              <th className="th">Détails</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="td" colSpan={6}>
                  Aucune entrée.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="tr-hover">
                  <td className="td">{formatDateTimeFr(row.createdAt)}</td>
                  <td className="td">{row.userName ?? row.userEmail ?? row.userId ?? "—"}</td>
                  <td className="td">{row.action}</td>
                  <td className="td">{row.entityType}</td>
                  <td className="td">{row.entityId ?? "—"}</td>
                  <td className="td">{row.metadata ? JSON.stringify(row.metadata) : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <nav className="mt-4 flex items-center gap-4">
        {page > 1 ? (
          <Link
            href={`/admin/audit?${baseQuery}${baseQuery ? "&" : ""}page=${page - 1}`}
            className="btn btn-secondary btn-sm"
          >
            Précédent
          </Link>
        ) : (
          <span className="muted">Précédent</span>
        )}
        <span className="muted">
          Page {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={`/admin/audit?${baseQuery}${baseQuery ? "&" : ""}page=${page + 1}`}
            className="btn btn-secondary btn-sm"
          >
            Suivant
          </Link>
        ) : (
          <span className="muted">Suivant</span>
        )}
      </nav>
    </AppShell>
  );
}
