const SAMPLES = [
  { id: 'subpoena', label: 'Criminal subpoena', file: 'subpoena.pdf', displayName: 'sample-subpoena.pdf' },
  { id: 'dmca', label: 'DMCA notice', file: 'dmca.pdf', displayName: 'sample-dmca.pdf' },
  { id: 'warrant', label: 'Search warrant', file: 'warrant.pdf', displayName: 'sample-warrant.pdf' },
];

function sampleButtonClasses(active) {
  const base =
    'rounded-full border px-3.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

  if (active) {
    return `${base} border-brand bg-brand-light text-brand-dark`;
  }
  return `${base} border-line bg-transparent text-ink-muted hover:border-line-secondary`;
}

export default function SampleButtons({
  selectedId,
  onSelect,
  disabled,
  onAnalyse,
  canAnalyse,
  extracting,
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-ink-muted md:text-sm">Try a sample document:</span>

      {SAMPLES.map((sample) => (
        <button
          key={sample.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(sample)}
          className={sampleButtonClasses(selectedId === sample.id)}
        >
          {sample.label}
        </button>
      ))}

      <button
        type="button"
        disabled={!canAnalyse || extracting}
        onClick={onAnalyse}
        className="ml-auto rounded-lg border-0 bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
      >
        Analyse request
      </button>
    </div>
  );
}

export { SAMPLES };
