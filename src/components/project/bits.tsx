/** Small shared pieces for project pages. */

export function PlaceholderTag({ children = "Placeholder" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-block rounded-[2px] border border-current px-1.5 py-px align-middle font-mono text-[10px] tracking-[0.12em] uppercase opacity-70">
      {children}
    </span>
  );
}

export function SectionLabel({ index, children, placeholder }: { index: string; children: React.ReactNode; placeholder?: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">
      <span>({index})</span>
      <span>{children}</span>
      {placeholder && <PlaceholderTag />}
    </p>
  );
}
