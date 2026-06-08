const METRICS = [
  { label: 'Requests this quarter', value: '1,247', trend: '+12% vs last',  trendOk: true },
  { label: 'SLA compliance',        value: '94.2%', trend: 'on track',      trendOk: true },
  { label: 'Avg triage time',       value: '2.4 min', trend: '↓ 68%',      trendOk: true },
  { label: 'Pending review',        value: '3',     trend: 'needs action',  trendOk: false },
];

export default function MetricsRibbon() {
  return (
    <div className="grid grid-cols-2 gap-px border-b border-nav-border bg-nav-border sm:grid-cols-4">
      {METRICS.map((m) => (
        <div key={m.label} className="bg-nav-bg px-5 py-3">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-nav-ink2">{m.label}</div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-semibold leading-none text-nav-ink1">{m.value}</span>
            <span className={`text-xs ${m.trendOk ? 'text-[oklch(0.62_0.16_145)]' : 'text-[oklch(0.82_0.155_78)]'}`}>
              {m.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
