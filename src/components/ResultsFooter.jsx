import { ShieldCheck } from 'lucide-react';

export default function ResultsFooter({ analysisId, generatedAt }) {
  return (
    <footer className="flex h-10 shrink-0 items-center gap-3 bg-nav px-4 md:h-11 md:px-6">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-ink-footer" strokeWidth={1.75} />
      <p className="text-xs text-ink-footer">
        Nexus · Confidential demo · Not legal advice · Powered by Claude AI
      </p>
      <p className="ml-auto hidden text-xs text-ink-dim md:block">
        Analysis ID: {analysisId} · Generated {generatedAt}
      </p>
    </footer>
  );
}
