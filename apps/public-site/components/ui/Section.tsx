import type { ReactNode } from "react";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`py-16 ${className ?? ""}`}>
      {children}
    </section>
  );
}
