import { ShieldCheck } from 'lucide-react';

const NAV_STATS = [
  { value: '1,247', label: 'requests this quarter', valueClass: 'text-white', labelClass: 'text-white/80' },
  { value: '94%', label: 'within SLA', valueClass: 'text-white', labelClass: 'text-white/80' },
  { value: '3', label: 'pending review', valueClass: 'text-amber-100', labelClass: 'text-white/80' },
];

export default function NavBar() {
  return (
    <header className="flex h-12 items-center justify-between bg-brand px-4 md:h-14 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-dark md:h-8 md:w-8">
          <ShieldCheck className="h-4 w-4 text-white md:h-[1.1rem] md:w-[1.1rem]" strokeWidth={2} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-white md:text-base">Nexus</span>
          <span className="text-xs text-white/70">Legal Triage</span>
        </div>
      </div>

      <div className="hidden items-center gap-8 sm:flex">
        {NAV_STATS.map((stat) => (
          <div key={stat.label} className="text-right">
            <div className={`text-lg font-medium leading-none ${stat.valueClass}`}>{stat.value}</div>
            <div className={`mt-0.5 text-xs ${stat.labelClass}`}>{stat.label}</div>
          </div>
        ))}
      </div>
    </header>
  );
}
