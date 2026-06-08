export default function SectionHeader({ label, count, tier }) {
  const countColor =
    tier === 'red'   ? 'text-red-ink' :
    tier === 'amber' ? 'text-amber-ink' :
    tier === 'green' ? 'text-green-ink' :
    'text-ink-3';

  return (
    <div className="flex items-center justify-between border-b border-t border-border-faint bg-surface-3 px-5 py-[7px]">
      <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-ink-3">{label}</span>
      {count != null && count !== '' && (
        <span className={`font-mono text-[11px] font-bold ${countColor}`}>{count}</span>
      )}
    </div>
  );
}
