const SAMPLES = [
  { id: 'subpoena', label: 'Criminal subpoena', file: 'subpoena.pdf', displayName: 'sample-subpoena.pdf' },
  { id: 'dmca',     label: 'DMCA notice',        file: 'dmca.pdf',     displayName: 'sample-dmca.pdf' },
  { id: 'warrant',  label: 'Search warrant',     file: 'warrant.pdf',  displayName: 'sample-warrant.pdf' },
];

export default function SampleButtons({ selectedId, onSelect, disabled, onAnalyse, canAnalyse, extracting }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border-faint bg-surface-2 px-5 py-3.5">
      <span className="text-[11px] font-medium text-ink-3 shrink-0">Try a sample:</span>

      {SAMPLES.map((sample) => {
        const active = selectedId === sample.id;
        return (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onSelect(sample)}
            className={[
              'h-[30px] rounded-md border px-3 text-[12px] font-medium transition-[color,box-shadow,transform] duration-150',
              'shadow-sm motion-safe:active:scale-[0.97]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              active
                ? 'border-blue-border bg-blue-mid text-blue-ink shadow-[0_0_0_2px_var(--blue-border)]'
                : 'border-border bg-surface text-ink-2 hover:border-border-strong hover:shadow-md',
            ].join(' ')}
          >
            {sample.label}
          </button>
        );
      })}

      <button
        type="button"
        disabled={!canAnalyse || extracting}
        onClick={onAnalyse}
        className="ml-auto flex h-[34px] items-center gap-1.5 rounded-lg bg-gradient-to-b from-blue to-blue-hover px-4 text-[13px] font-semibold text-white shadow-[0_1px_2px_oklch(0_0_0/0.2),inset_0_1px_0_oklch(1_0_0/0.15)] transition-[color,box-shadow,transform] duration-150 hover:brightness-110 motion-safe:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
        Analyse request
      </button>
    </div>
  );
}

export { SAMPLES };
