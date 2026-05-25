const COLOR_MAP = {
  '#991b1b': 'text-danger',
  '#166534': 'text-success',
};

export default function SectionHeader({ label, count, color }) {
  const accentClass = color ? COLOR_MAP[color] || 'text-ink-secondary' : 'text-ink-secondary';

  return (
    <div className="flex items-center gap-3 px-3 pb-2 pt-3 md:px-4">
      <span className={`whitespace-nowrap text-xs font-medium uppercase tracking-widest ${accentClass}`}>
        {label}
      </span>
      <div
        className="h-px flex-1 bg-line"
        style={color ? { backgroundColor: `${color}66` } : undefined}
      />
      {count != null && count !== '' && (
        <span className={`whitespace-nowrap text-xs font-medium ${accentClass}`}>{count}</span>
      )}
    </div>
  );
}
