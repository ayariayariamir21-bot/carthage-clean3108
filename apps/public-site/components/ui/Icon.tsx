import type { ReactNode } from "react";

export type IconName =
  | "trash"
  | "broom"
  | "leaf"
  | "truck"
  | "shield"
  | "bell"
  | "phone"
  | "mail"
  | "map"
  | "clock"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "instagram"
  | "menu"
  | "close"
  | "user"
  | "message"
  | "check";

const ICONS: Record<IconName, ReactNode> = {
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </>
  ),
  broom: (
    <>
      <path d="M19 4l1 1-9 9-2-2 9-9z" />
      <path d="M14 9l-2 2-6 6v3h3l6-6" />
    </>
  ),
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 4 13C4 8 11 4 20 4c0 9-4 16-9 16z" />
      <path d="M4 20c4-4 7-7 12-9" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  phone: (
    <>
      <path d="M3 5a2 2 0 0 1 2-2h2l2 4-2 1a12 12 0 0 0 5 5l1-2 4 2v2a2 2 0 0 1-2 2A16 16 0 0 1 3 7z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  facebook: <path d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8a1 1 0 0 1 1-1z" />,
  twitter: (
    <path d="M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.2-.8.5-1.6.8-2.5 1a3.9 3.9 0 0 0-6.6 3.5A11 11 0 0 1 3.6 4.5a3.9 3.9 0 0 0 1.2 5.2c-.6 0-1.2-.2-1.7-.5a3.9 3.9 0 0 0 3.1 3.8c-.5.2-1.1.2-1.7.1a3.9 3.9 0 0 0 3.6 2.7A7.8 7.8 0 0 1 2 17.5a11 11 0 0 0 6 1.7c7.2 0 11.1-6 11.1-11.1v-.5c.8-.6 1.4-1.3 1.9-2.1z" />
  ),
  linkedin: (
    <>
      <path d="M6.9 8H4.5V20h2.4V8z" />
      <path d="M5.7 3.5A1.5 1.5 0 1 0 5.7 6.5 1.5 1.5 0 0 0 5.7 3.5z" />
      <path d="M20 13.5c0-2.6-1.4-3.8-3.2-3.8a2.8 2.8 0 0 0-2.5 1.4V8H11.9V20h2.4v-6c0-1.3.6-2 1.8-2s1.8.8 1.8 2.1v6H20z" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  message: <path d="M21 11.5a8.5 8.5 0 0 1-12 7.6L3 21l1.9-6A8.5 8.5 0 1 1 21 11.5z" />,
  check: <path d="M5 13l4 4L19 7" />,
};

export function Icon({
  name,
  className,
  size = 24,
}: {
  name: IconName;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
