const ACTIVITIES = [
  {
    badge: 'EMERGENCY',
    badgeClass: 'bg-brand-light text-brand-dark',
    time: '2 min ago',
    title: 'Emergency disclosure request',
    detail: 'SFPD · Routed to Senior Analyst',
  },
  {
    badge: 'ROUTINE',
    badgeClass: 'bg-success-soft text-success',
    time: '14 min ago',
    title: 'ECPA subpoena — subscriber info',
    detail: 'USAO NDCA · Junior Analyst',
  },
  {
    badge: 'PRIORITY',
    badgeClass: 'bg-warning-light text-warning-strong',
    time: '1 hr ago',
    title: 'Search warrant — content request',
    detail: 'Travis Co. Sheriff · 3 red flags',
  },
  {
    badge: 'ROUTINE',
    badgeClass: 'bg-success-soft text-success',
    time: '2 hr ago',
    title: 'DMCA takedown subpoena',
    detail: 'Hartley IP Law · AI drafted',
  },
  {
    badge: 'ROUTINE',
    badgeClass: 'bg-success-soft text-success',
    time: '3 hr ago',
    title: 'Civil subpoena — user records',
    detail: 'LASC · Junior Analyst',
  },
];

export default function RecentActivity() {
  return (
    <aside className="h-fit overflow-hidden rounded-xl border border-line bg-surface-primary">
      <div className="flex items-center border-b border-line px-4 py-3.5">
        <h2 className="text-sm font-medium text-ink-primary">Recent requests</h2>
        <button type="button" className="ml-auto text-xs text-brand hover:text-brand-dark">
          View all
        </button>
      </div>

      <ul>
        {ACTIVITIES.map((item, index) => (
          <li
            key={item.title}
            className={`px-4 py-2.5 ${index < ACTIVITIES.length - 1 ? 'border-b border-line' : ''}`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className={`rounded px-1.5 py-0.5 text-xs font-semibold tracking-wide ${item.badgeClass}`}>
                {item.badge}
              </span>
              <span className="text-xs text-ink-muted">{item.time}</span>
            </div>
            <p className="text-xs font-medium leading-snug text-ink-primary md:text-sm">{item.title}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{item.detail}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
