import { Brain, FileSearch, Route } from 'lucide-react';

const STEPS = [
  {
    icon: FileSearch,
    title: '1. Upload document',
    body: 'PDF, DOCX or TXT — up to 50MB. Full text extracted automatically.',
  },
  {
    icon: Brain,
    title: '2. AI analyses',
    body: 'Classifies type, extracts key fields, flags red flags and urgency.',
  },
  {
    icon: Route,
    title: '3. Routed instantly',
    body: 'Structured output with routing recommendation in under 30 seconds.',
  },
];

export default function HowItWorks() {
  return (
    <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {STEPS.map((step) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className="rounded-lg border border-line bg-surface-primary p-3.5 md:p-4">
            <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
            <h3 className="mt-2 text-sm font-medium text-ink-primary">{step.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted md:text-sm">{step.body}</p>
          </div>
        );
      })}
    </div>
  );
}
