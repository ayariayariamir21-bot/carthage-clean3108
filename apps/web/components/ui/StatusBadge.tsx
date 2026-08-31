const TOUR_LABELS: Record<string, string> = {
  planifiée: "Planifiée",
  en_cours: "En cours",
  terminée: "Terminée",
  annulée: "Annulée",
};

const TOUR_CLASS: Record<string, string> = {
  planifiée: "badge-planifiee",
  en_cours: "badge-encours",
  terminée: "badge-terminee",
  annulée: "badge-annulee",
};

export function StatusBadge({ status }: { status: string }) {
  const label = TOUR_LABELS[status] ?? status;
  const cls = TOUR_CLASS[status] ?? "badge-neutral";
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`badge ${active ? "badge-active" : "badge-inactive"}`}>
      {active ? "Actif" : "Inactif"}
    </span>
  );
}
