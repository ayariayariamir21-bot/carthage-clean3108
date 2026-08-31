import type { IconName } from "@/components/ui/Icon";

export const SITE = {
  name: "Carthage-Clean",
  legalName: "Régie de Propreté Urbaine de Carthage",
  tagline: "La propreté de Carthage, au cœur de la ville.",
  description:
    "Carthage-Clean assure la collecte des déchets, le nettoyage des espaces publics et l'entretien des espaces verts pour une ville propre, sûre et agréable à vivre.",
  email: "contact@carthage-clean.tn",
  phone: "+216 71 000 000",
  address: "Avenue Habib Bourguiba, 2016 Carthage, Tunisie",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Carthage%20Tunisie",
  contactIntro:
    "Une question, une demande ou un signalement de propreté ? Écrivez-nous, nous vous répondons rapidement.",
  hours: [
    { day: "Lundi – Vendredi", time: "08h00 – 17h00" },
    { day: "Samedi", time: "08h00 – 12h00" },
    { day: "Dimanche", time: "Fermé (astreinte urgence)" },
  ],
  socials: [
    { name: "facebook" as IconName, label: "Facebook", href: "#" },
    { name: "twitter" as IconName, label: "X / Twitter", href: "#" },
    { name: "linkedin" as IconName, label: "LinkedIn", href: "#" },
    { name: "instagram" as IconName, label: "Instagram", href: "#" },
  ],
};

export const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Services" },
  { href: "/zones", label: "Zones" },
  { href: "/contact", label: "Contact" },
];

export const STATS: Array<{ value: string; label: string }> = [
  { value: "12", label: "Zones couvertes" },
  { value: "180", label: "Agents sur le terrain" },
  { value: "45", label: "Tournées par jour" },
  { value: "9 500", label: "Tonnes collectées / an" },
];

export const SERVICES: Array<{
  icon: IconName;
  title: string;
  description: string;
}> = [
  {
    icon: "trash",
    title: "Collecte des déchets",
    description:
      "Collecte régulière des ordures ménagères et des déchets triés, avec un planning adapté à chaque quartier et des bennes enterrées sécurisées.",
  },
  {
    icon: "broom",
    title: "Nettoyage des rues",
    description:
      "Balayage manuel et mécanisé, lavage des voies publiques, désherbage et entretien courant des trottoirs et places.",
  },
  {
    icon: "leaf",
    title: "Gestion des espaces verts",
    description:
      "Tonte, arrosage et entretien des parcs et jardins, plantation saisonnière et protection de la biodiversité urbaine.",
  },
  {
    icon: "truck",
    title: "Enlèvement des encombrants",
    description:
      "Prise en charge sur rendez-vous des meubles, gravats et objets volumineux, avec une filière de recyclage responsable.",
  },
  {
    icon: "shield",
    title: "Lutte anti-incivilités",
    description:
      "Surveillance, signalement et interventions rapides contre les dépôts sauvages et le dépôt incontrôlé d'affichage.",
  },
  {
    icon: "bell",
    title: "Signalement citoyen",
    description:
      "Un canal simple pour déclarer un problème de propreté ; nos équipes planifient et suivent chaque demande jusqu'à résolution.",
  },
];

export const ZONES: Array<{
  name: string;
  code: string;
  description: string;
  highlights: string[];
}> = [
  {
    name: "Carthage Centre",
    code: "ZN-01",
    description:
      "Cœur historique et administrative : ruelles, sites archéologiques et front de mer à forte affluence.",
    highlights: ["Balayage quotidien", "Bennes enterrées", "Lavage nocturne"],
  },
  {
    name: "Amilcar",
    code: "ZN-02",
    description:
      "Quartier résidentiel côtier avec villas, plages et espaces verts à protéger toute l'année.",
    highlights: ["Espaces verts", "Plages", "Collecte tri"],
  },
  {
    name: "Byrsa",
    code: "ZN-03",
    description:
      "Secteur touristique et culturel : musées, hôtels et commerces nécessitant une présence renforcée.",
    highlights: ["Tourisme", "Jour de marché", "Surveillance"],
  },
  {
    name: "Dermech",
    code: "ZN-04",
    description:
      "Zone portuaire et artisanale, avec gestion spécifique des déchets professionnels et des encombrants.",
    highlights: ["Encombrants", "Déchets pro", "Quais"],
  },
  {
    name: "Sidi Bou Saïd",
    code: "ZN-05",
    description:
      "Village pittoresque classé : propreté préservée, accès piéton et protection du patrimoine.",
    highlights: ["Patrimoine", "Piétons", "Tri sélectif"],
  },
  {
    name: "La Goulette",
    code: "ZN-06",
    description:
      "Secteur portuaire et de loisirs : marché aux poissons, corniche et fortes flux le week-end.",
    highlights: ["Corniche", "Marché", "Week-ends"],
  },
];

export const NEWS: Array<{
  date: string;
  title: string;
  excerpt: string;
}> = [
  {
    date: "12 mai 2026",
    title: "Lancement du nouveau planning de collecte estivale",
    excerpt:
      "Dès le 1er juin, les tournées de collecte sont renforcées sur le front de mer pour faire face à l'affluence estivale.",
  },
  {
    date: "28 avril 2026",
    title: "Carthage-Clean dépasse les 9 000 tonnes recyclées",
    excerpt:
      "Grâce au tri sélectif, la régie affiche une progression de 14 % du taux de recyclage sur les douze derniers mois.",
  },
  {
    date: "03 avril 2026",
    title: "Campagne de nettoyage citoyenne à Byrsa",
    excerpt:
      "Écoles et associations se sont mobilisées pour une matinée de propreté autour du site archéologique.",
  },
];

export const TEAM: Array<{
  name: string;
  role: string;
  initials: string;
}> = [
  { name: "Leïla Ben Ammar", role: "Directrice générale", initials: "LB" },
  { name: "Karim Trabelsi", role: "Responsable des opérations", initials: "KT" },
  { name: "Sana Gharbi", role: "Coordinatrice des espaces verts", initials: "SG" },
  { name: "Youssef Mansour", role: "Chargé du signalement citoyen", initials: "YM" },
];
