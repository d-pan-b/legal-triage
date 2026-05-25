const METRICS = [
  {
    label: 'Requests this quarter',
    value: '1,247',
    trend: '+12% vs last',
    trendClass: 'text-emerald-400',
    divider: false,
  },
  {
    label: 'SLA compliance',
    value: '94.2%',
    trend: 'on track',
    trendClass: 'text-emerald-400',
    divider: true,
  },
  {
    label: 'Avg triage time',
    value: '2.4 min',
    trend: '↓ 68%',
    trendClass: 'text-brand',
    divider: true,
  },
  {
    label: 'Pending review',
    value: '3',
    trend: 'needs action',
    trendClass: 'text-amber-500',
    divider: true,
  },
];

export default function MetricsRibbon() {
  return (
    <div className="grid grid-cols-2 gap-px border-b border-portal-border bg-portal-ribbon px-4 py-3 sm:grid-cols-4 md:px-6">
      {METRICS.map((metric) => (
        <div
          key={metric.label}
          className={`min-w-0 ${metric.divider ? 'border-l border-portal-border pl-4 md:pl-6' : ''}`}
        >
          <div className="mb-0.5 text-xs text-portal-muted">{metric.label}</div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-medium leading-none text-white">{metric.value}</span>
            <span className={`text-xs ${metric.trendClass}`}>{metric.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
