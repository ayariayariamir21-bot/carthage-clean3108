import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage } from "@/lib/auth/guard";
import { dbAgentRepository } from "@/lib/auth/agents";
import { dbZoneRepository } from "@/lib/zones/service";
import { AppShell } from "@/components/layout/AppShell";
import { MainZoneForm } from "./main-zone-form";

export default async function AgentMainZonePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRolePage("admin");
  const { id: userId } = await params;

  const agent = await dbAgentRepository.findAgentById(userId);
  if (!agent) {
    notFound();
  }

  const zones = await dbZoneRepository.listZones();
  const activeZones = zones.filter((z) => z.isActive);

  return (
    <AppShell user={user}>
      <Link href="/admin/agents" className="link">
        ← Retour aux comptes
      </Link>
      <h1 className="mb-2 mt-2 text-2xl font-bold text-slate-800">Zone principale</h1>
      <p className="mb-6 text-slate-600">
        Compte : <strong>{agent.name ?? agent.email}</strong> (rôle {agent.role})
      </p>

      {agent.role !== "agent" ? (
        <div className="alert alert-info">
          Seul un agent peut avoir un rattachement principal à une zone.
        </div>
      ) : (
        <MainZoneForm
          userId={userId}
          zones={activeZones}
          currentZoneId={agent.defaultZoneId}
          currentZoneName={agent.defaultZoneName}
        />
      )}
    </AppShell>
  );
}
