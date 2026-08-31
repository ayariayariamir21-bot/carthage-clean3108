import { requireRolesPage } from "@/lib/auth/guard";
import { dbZoneRepository } from "@/lib/zones/service";
import { AppShell } from "@/components/layout/AppShell";
import { ZoneCreateForm } from "./zone-create-form";
import { ZoneList } from "./zone-list";

export default async function AdminZonesPage() {
  const user = await requireRolesPage(["admin", "supervisor"]);
  const zones = await dbZoneRepository.listZones();

  return (
    <AppShell user={user}>
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Gestion des zones de collecte</h1>
      <p className="mb-6 text-slate-600">
        Réservé aux rôles <strong>admin</strong> et <strong>supervisor</strong>. Les zones
        désactivées ne peuvent plus être affectées à de nouvelles tournées.
      </p>

      <ZoneCreateForm />

      <h2 className="mb-3 text-lg font-semibold text-slate-800">
        Zones existantes ({zones.length})
      </h2>
      <ZoneList zones={zones} />
    </AppShell>
  );
}
