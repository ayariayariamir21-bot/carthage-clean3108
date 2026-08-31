import { requireRolePage } from "@/lib/auth/guard";
import { dbAgentRepository } from "@/lib/auth/agents";
import { AppShell } from "@/components/layout/AppShell";
import { AgentCreateForm } from "./agent-create-form";
import { AgentList } from "./agent-list";

export default async function AdminAgentsPage() {
  const user = await requireRolePage("admin");
  const agents = await dbAgentRepository.listUsers();

  return (
    <AppShell user={user}>
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Gestion des comptes</h1>
      <p className="mb-6 text-slate-600">
        Réservé aux administrateurs. Création de comptes <strong>agent</strong>, enrichissement du
        profil opérationnel et rattachement principal à une zone.
      </p>

      <AgentCreateForm />

      <h2 className="mb-3 text-lg font-semibold text-slate-800">Comptes ({agents.length})</h2>
      <AgentList agents={agents} />
    </AppShell>
  );
}
