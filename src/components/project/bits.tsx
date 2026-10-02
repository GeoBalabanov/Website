/** Small shared pieces for project pages. */

export function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">
      <span>({index})</span>
      <span>{children}</span>
    </p>
  );
}
