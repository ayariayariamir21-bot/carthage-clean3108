import Link from "next/link";
import { requireRolesPage } from "@/lib/auth/guard";
import { dbZoneRepository } from "@/lib/zones/service";
import { dbAgentRepository } from "@/lib/auth/agents";
import { AppShell } from "@/components/layout/AppShell";
import { TourCreateForm } from "./tour-create-form";

export default async function NewTourPage() {
  const user = await requireRolesPage(["admin", "supervisor"]);

  const [zones, agents] = await Promise.all([
    dbZoneRepository.listZones(),
    dbAgentRepository.listAgents(),
  ]);

  const activeZones = zones.filter((z) => z.isActive);
  const activeAgents = agents.filter((a) => a.isActive);

  return (
    <AppShell user={user}>
      <Link href="/admin/tours" className="link">
        ← Retour aux tournées
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold text-slate-800">Créer une tournée</h1>

      {activeZones.length === 0 ? (
        <div className="alert alert-error">
          Aucune zone active disponible. Créez une zone active d&apos;abord.
        </div>
      ) : (
        <TourCreateForm
          zones={activeZones}
          agents={activeAgents.map((a) => ({ id: a.id, name: a.name, matricule: a.matricule }))}
        />
      )}
    </AppShell>
  );
}
