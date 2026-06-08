export default function ResultsFooter({ analysisId, generatedAt }) {
  return (
    <footer className="flex h-10 shrink-0 items-center gap-3 border-t border-nav-border bg-nav-bg px-5">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-40">
        <path d="M8 2L3 5v4c0 3 2.5 5 5 5s5-2 5-5V5L8 2z" stroke="var(--nav-ink-1)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 8l1.5 1.5L10 6" stroke="var(--nav-ink-1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-[11px] text-nav-ink2">
        Nexus · Confidential demo · Not legal advice · Powered by Claude AI
      </p>
      <p className="ml-auto hidden text-[11px] text-[oklch(0.66_0.010_252)] md:block">
        {analysisId} · {generatedAt}
      </p>
    </footer>
  );
}
