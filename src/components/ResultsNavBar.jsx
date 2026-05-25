import { ShieldCheck } from 'lucide-react';

export default function ResultsNavBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 bg-nav px-4 md:h-14 md:gap-3 md:px-6">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand md:h-8 md:w-8">
        <ShieldCheck className="h-4 w-4 text-white md:h-[1.1rem] md:w-[1.1rem]" strokeWidth={2} />
      </div>

      <span className="text-sm font-medium text-white md:text-base">Nexus</span>
      <span className="hidden text-xs text-portal-muted sm:block">Legal Triage</span>

      <nav className="ml-4 hidden items-center gap-2 sm:flex" aria-label="Breadcrumb">
        <span className="text-xs text-portal-muted">Triage</span>
        <span className="text-xs text-ink-dim">/</span>
        <span className="text-xs text-brand">Analysis result</span>
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-xs text-ink-faint md:block">Analyst</span>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-medium text-white md:h-8 md:w-8">
          AN
        </div>
      </div>
    </header>
  );
}
