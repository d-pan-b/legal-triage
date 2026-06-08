const ACTIVITIES = [
  { tier: 'red',   routing: 'Counsel Only',   time: '2 min ago',  name: 'Emergency disclosure request',    detail: 'SFPD' },
  { tier: 'amber', routing: 'Senior Analyst',  time: '14 min ago', name: 'ECPA subpoena: subscriber info', detail: 'USAO NDCA' },
  { tier: 'red',   routing: 'Counsel Only',    time: '1 hr ago',   name: 'Search warrant: content request',detail: 'Travis Co. Sheriff' },
  { tier: 'blue',  routing: 'Junior Analyst',  time: '2 hr ago',   name: 'DMCA takedown notice',            detail: 'Hartley IP Law' },
  { tier: 'blue',  routing: 'Junior Analyst',  time: '3 hr ago',   name: 'Civil subpoena: user records',   detail: 'LASC' },
  { tier: 'green', routing: 'Routed · Complete', time: 'Yesterday', name: 'Preservation request',           detail: 'FBI SF Field Office' },
];

const DOT_COLOR = {
  red:   'bg-red',
  amber: 'bg-amber',
  blue:  'bg-blue',
  green: 'bg-green',
};

const ROUTING_COLOR = {
  red:   'text-red-ink',
  amber: 'text-amber-ink',
  blue:  'text-blue-ink',
  green: 'text-green-ink',
};

export default function RecentActivity() {
  return (
    <aside className="overflow-hidden rounded-xl border border-border bg-surface shadow-md">
      <div className="flex items-center justify-between border-b border-border-faint bg-gradient-to-b from-surface to-surface-2 px-4 py-3.5">
        <h2 className="text-[13px] font-semibold text-ink-1">Recent</h2>
        <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-3">
          12 this week
        </span>
      </div>

      <ul>
        {ACTIVITIES.map((item, i) => (
          <li
            key={item.name}
            className={`flex cursor-pointer items-start gap-2.5 px-4 py-3 transition-colors hover:bg-surface-2 ${
              i < ACTIVITIES.length - 1 ? 'border-b border-border-faint' : ''
            }`}
          >
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-[3px] ${DOT_COLOR[item.tier]}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-ink-1">{item.name}</p>
              <p className="mt-0.5 font-mono text-[10px] text-ink-4">
                {item.time} · {item.detail}
              </p>
              <p className={`mt-1 text-[10px] font-semibold ${ROUTING_COLOR[item.tier]}`}>
                {item.routing}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
