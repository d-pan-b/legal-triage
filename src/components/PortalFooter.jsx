import { ShieldCheck } from 'lucide-react';

export default function PortalFooter() {
  return (
    <footer className="flex items-center gap-4 bg-nav px-4 py-3 md:px-6">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-portal-muted" strokeWidth={1.75} />
      <p className="text-xs text-ink-footer">
        Nexus · Confidential demo · Not legal advice · Powered by Claude AI
      </p>
    </footer>
  );
}
