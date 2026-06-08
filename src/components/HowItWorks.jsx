const STEPS = [
  {
    num: '01',
    title: 'Upload or paste',
    body: 'PDF, DOCX, or plain text. Max 20 MB. Document stays on your network.',
  },
  {
    num: '02',
    title: 'Fields extracted by AI',
    body: 'Extracts legal basis, authority, data scope, deadline, and risk flags for reviewer confirmation.',
  },
  {
    num: '03',
    title: 'Reviewer confirms routing',
    body: 'Confirm, override, or escalate the suggested routing. Every decision is logged to the audit trail.',
  },
];

export default function HowItWorks() {
  return (
    <div className="mt-4 grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface shadow-sm sm:grid-cols-3">
      {STEPS.map((step, i) => (
        <div
          key={step.num}
          className={`p-5 ${i < STEPS.length - 1 ? 'border-b border-border-faint sm:border-b-0 sm:border-r' : ''}`}
        >
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-medium text-ink-4">
            <span className="h-[5px] w-[5px] rounded-full bg-blue opacity-70" />
            Step {step.num}
          </div>
          <h3 className="mb-1 text-[13px] font-semibold text-ink-1">{step.title}</h3>
          <p className="text-[12px] leading-relaxed text-ink-3">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
