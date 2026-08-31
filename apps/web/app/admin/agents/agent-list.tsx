"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AgentRecord } from "@/lib/auth/agents";
import { AgentEditForm } from "./agent-edit-form";
import { toggleAgentActiveAction } from "./actions";
import { ActiveBadge } from "@/components/ui/StatusBadge";

type StatusFilter = "all" | "active" | "inactive";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  supervisor: "Superviseur",
  agent: "Agent",
};

function formatDate(date: string | null): string {
  return date ?? "—";
}

export function AgentList({ agents }: { agents: AgentRecord[] }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [team, setTeam] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const teams = useMemo(
    () =>
      Array.from(new Set(agents.map((a) => a.team).filter((t): t is string => t !== null))).sort(),
    [agents],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agents.filter((a) => {
      if (role !== "all" && a.role !== role) return false;
      if (team !== "all" && a.team !== team) return false;
      if (status === "active" && !a.isActive) return false;
      if (status === "inactive" && a.isActive) return false;
      if (q) {
        const haystack = `${a.name ?? ""} ${a.email} ${a.matricule ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [agents, search, role, team, status]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="field mb-0 min-w-[200px] flex-1">
          <label className="label" htmlFor="agent-search">
            Recherche
          </label>
          <input
            id="agent-search"
            type="search"
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="nom, email, matricule"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="agent-role">
            Rôle
          </label>
          <select
            id="agent-role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Superviseur</option>
            <option value="agent">Agent</option>
          </select>
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="agent-team">
            Équipe
          </label>
          <select
            id="agent-team"
            className="input"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          >
            <option value="all">Toutes</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="agent-status">
            Statut
          </label>
          <select
            id="agent-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="alert alert-info">Aucun compte à afficher.</div>
      ) : (
        <ul className="grid gap-4">
          {visible.map((agent) => (
            <li key={agent.id} className="card card-body">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">
                    {agent.name ?? "(sans nom)"} <span className="muted">— {agent.email}</span>
                  </div>
                  <div className="mt-1 text-slate-500">
                    {agent.matricule ? `matricule ${agent.matricule} — ` : null}
                    {agent.phone ? `☎ ${agent.phone} — ` : null}
                    {agent.team ? `équipe ${agent.team} — ` : null}
                    {`embauché ${formatDate(agent.hireDate)}`}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ActiveBadge active={agent.isActive} />
                    <span className="badge badge-neutral">
                      {ROLE_LABELS[agent.role] ?? agent.role}
                    </span>
                    {agent.role === "agent" ? (
                      <span className="muted">
                        zone : <strong>{agent.defaultZoneName ?? "—"}</strong>{" "}
                        <Link href={`/admin/agents/${agent.id}/main-zone`} className="link">
                          Définir zone principale
                        </Link>
                      </span>
                    ) : null}
                  </div>
                </div>
                <form action={toggleAgentActiveAction}>
                  <input type="hidden" name="id" value={agent.id} />
                  <input type="hidden" name="active" value={String(agent.isActive)} />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    {agent.isActive ? "Désactiver" : "Activer"}
                  </button>
                </form>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <AgentEditForm agent={agent} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
