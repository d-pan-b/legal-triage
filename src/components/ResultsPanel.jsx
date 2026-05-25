import { useMemo, useState } from 'react';
import {
  Download,
  Maximize2,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  UserCheck,
  RefreshCw,
  FileText,
  Building2,
  Clock,
  Zap,
  Database,
  GitBranch,
} from 'lucide-react';
import SectionHeader from './SectionHeader';
import ResultsNavBar from './ResultsNavBar';
import ResultsFooter from './ResultsFooter';

function requestTypeStyles(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('criminal')) return 'bg-brand-light text-brand-dark';
  if (t.includes('civil')) return 'bg-civil-light text-civil';
  if (t.includes('dmca')) return 'bg-dmca-light text-dmca';
  if (t.includes('fisa') || t.includes('nsl')) return 'bg-fisa-light text-fisa';
  if (t.includes('emergency')) return 'bg-danger-light text-danger';
  return 'bg-surface-secondary text-ink-secondary';
}

function urgencyStyles(level) {
  const u = (level || '').toLowerCase();
  if (u.includes('emergency')) return 'bg-danger-light text-danger';
  if (u.includes('priority')) return 'bg-warning-light text-warning';
  return 'bg-success-light text-success';
}

function routingStyles(routing) {
  const r = (routing || '').toLowerCase();
  if (r.includes('counsel')) return 'bg-danger-light text-danger';
  if (r.includes('senior')) return 'bg-warning-light text-warning';
  return 'bg-junior-light text-junior';
}

function redFlagsBadgeStyles(count) {
  if (count === 0) return 'bg-success-light text-success';
  if (count <= 2) return 'bg-warning-light text-warning';
  return 'bg-danger-light text-danger';
}

function verdictTitle(routing) {
  const r = (routing || '').toLowerCase();
  if (r.includes('counsel')) return 'Do not comply without counsel review';
  if (r.includes('senior')) return 'Escalate to senior analyst before action';
  return 'Route to analyst for standard processing';
}

function primaryAction(routing) {
  const r = (routing || '').toLowerCase();
  if (r.includes('counsel')) {
    return { label: 'Escalate to counsel', Icon: ArrowRight };
  }
  if (r.includes('senior')) {
    return { label: 'Escalate to senior analyst', Icon: ArrowRight };
  }
  return { label: 'Assign to analyst', Icon: UserCheck };
}

function valueWarningClass(value) {
  const v = (value || '').toLowerCase();
  if (
    v.includes('unknown') ||
    v.includes('not specified') ||
    v.includes('missing') ||
    v.includes('conflict') ||
    v.includes('multi-jurisdictional')
  ) {
    return 'text-warning';
  }
  return 'text-ink-primary';
}

function firstSentence(text) {
  if (!text) return '';
  const idx = text.indexOf('.');
  if (idx > 0 && idx < 120) return text.slice(0, idx + 1).trim();
  return text.length > 120 ? `${text.slice(0, 120)}...` : text;
}

function flagTitle(flag) {
  const idx = flag.indexOf('.');
  if (idx > 0 && idx <= 80) return flag.slice(0, idx + 1);
  return flag.length > 80 ? `${flag.slice(0, 80)}...` : flag;
}

function flagSeverity(flag) {
  const f = flag.toLowerCase();
  if (
    f.includes('civil liability') ||
    f.includes('federal warrant') ||
    f.includes('fourth amendment') ||
    f.includes('particularity')
  ) {
    return { label: 'Critical', className: 'bg-danger-light text-danger' };
  }
  if (f.includes('jurisdictional') || f.includes('nexus') || f.includes('overreach')) {
    return { label: 'High', className: 'bg-warning-light text-warning' };
  }
  return { label: 'Medium', className: 'bg-dmca-light text-dmca' };
}

function isSectionHeader(line) {
  const trimmed = line.trim();
  if (trimmed.length < 12) return false;
  const letters = trimmed.replace(/[^A-Za-z]/g, '');
  if (letters.length < 8) return false;
  const upper = trimmed === trimmed.toUpperCase();
  const commanded =
    /^(YOU ARE|TO:|FROM:|RE:|SUBJECT:|IN THE MATTER|SEARCH AND|UNITED STATES)/i.test(trimmed) &&
    trimmed.length < 120;
  return upper || commanded;
}

function formatDocumentLines(text) {
  return (text || '').split('\n');
}

function estimatePages(text) {
  const len = (text || '').length;
  return Math.max(1, Math.ceil(len / 3000));
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function FieldCard({ icon: Icon, label, value, sub, className = '', children }) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface-primary p-3 md:p-4 ${className}`}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        {label}
      </div>
      {children ?? (
        <p className={`text-sm font-medium leading-snug ${valueWarningClass(value)}`}>{value || '—'}</p>
      )}
      {sub && (
        <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{sub}</p>
      )}
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-1.5 rounded-md border border-line-secondary bg-transparent px-2.5 py-1.5 text-xs text-ink-secondary transition-colors hover:bg-surface-secondary ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function ResultsPanel({ documentText, triage, onReset, fileName = 'Document', fileSize }) {
  const [analysisMeta] = useState(() => ({
    id: `TRG-${Date.now()}`,
    generatedAt: new Date().toLocaleString(),
  }));

  const redFlags = Array.isArray(triage.red_flags) ? triage.red_flags : [];
  const routing = triage.recommended_routing || '';
  const { label: primaryLabel, Icon: PrimaryIcon } = primaryAction(routing);
  const docLines = useMemo(() => formatDocumentLines(documentText), [documentText]);
  const pageCount = estimatePages(documentText);

  const handleDownload = () => {
    const blob = new Blob([documentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, '') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFullView = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<pre style="font-family:Georgia,serif;padding:2rem;white-space:pre-wrap;line-height:1.6">${documentText.replace(/</g, '&lt;')}</pre>`);
      w.document.close();
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(triage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triage-report-${analysisMeta.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const metaParts = [fileName];
  const sizeLabel = formatFileSize(fileSize);
  if (sizeLabel) metaParts.push(sizeLabel);
  metaParts.push(`${pageCount} pages`);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ResultsNavBar />

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:h-[calc(100vh-3rem-2.5rem)] lg:grid-cols-2">
        {/* Left pane — document */}
        <section className="flex min-h-[40vh] flex-col border-b border-line bg-surface-primary lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-line bg-surface-primary px-4 py-3 md:px-5">
            <div>
              <h2 className="text-sm font-medium text-ink-primary">Original document</h2>
              <p className="mt-0.5 text-xs text-ink-secondary">{metaParts.join(' · ')}</p>
            </div>
            <div className="flex gap-2">
              <ToolbarButton icon={Download} label="Download" onClick={handleDownload} />
              <ToolbarButton icon={Maximize2} label="Full view" onClick={handleFullView} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            <div
              className="text-xs leading-relaxed text-ink-secondary md:text-sm"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {docLines.map((line, i) =>
                isSectionHeader(line) ? (
                  <p
                    key={i}
                    className="mb-1 mt-3 font-sans text-xs font-semibold text-ink-primary md:text-sm"
                  >
                    {line}
                  </p>
                ) : (
                  <p key={i} className="mb-1">
                    {line || '\u00A0'}
                  </p>
                )
              )}
            </div>

            {triage.truncated === true && (
              <div className="mt-4 rounded-r-lg border-l-[3px] border-danger-border bg-danger-light p-3">
                <p className="mb-1 font-sans text-xs font-medium text-danger">Document truncated here</p>
                <p className="font-sans text-xs leading-relaxed text-danger-dark">
                  Analysis based on content above this point only.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right pane — triage */}
        <section className="flex min-h-[40vh] flex-col overflow-y-auto bg-surface-secondary lg:min-h-0">
          {/* Verdict bar */}
          <div className="shrink-0 border-b border-line bg-surface-primary px-4 py-4 md:px-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className={requestTypeStyles(triage.request_type)}>{triage.request_type || 'Unknown'}</Badge>
              <Badge className={urgencyStyles(triage.urgency_level)}>{triage.urgency_level || '—'}</Badge>
              <Badge className={routingStyles(routing)}>
                <UserCheck className="h-3 w-3" strokeWidth={2} />
                {routing || '—'}
              </Badge>
              <Badge className={redFlagsBadgeStyles(redFlags.length)}>
                <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                {redFlags.length === 0 ? 'No red flags' : `${redFlags.length} red flag${redFlags.length > 1 ? 's' : ''}`}
              </Badge>
            </div>

            <h1 className="mb-1.5 text-base font-medium text-ink-primary md:text-lg">
              {verdictTitle(routing)}
            </h1>
            <p className="mb-3 text-xs leading-relaxed text-ink-secondary md:text-sm">
              {triage.routing_rationale || '—'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-brand px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-dark md:px-4 md:text-sm"
              >
                <PrimaryIcon className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2} />
                {primaryLabel}
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line-secondary bg-surface-primary px-3 py-2 text-xs text-ink-primary transition-colors hover:bg-surface-secondary md:px-4 md:text-sm"
              >
                <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={1.75} />
                Export report
              </button>
              <button
                type="button"
                onClick={onReset}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line-secondary bg-surface-primary px-3 py-2 text-xs text-ink-secondary transition-colors hover:bg-surface-secondary md:px-4 md:text-sm"
              >
                <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={1.75} />
                New analysis
              </button>
            </div>
          </div>

          {triage.truncated === true && (
            <div className="flex shrink-0 items-center gap-3 border-b border-warn-border bg-warning-light px-4 py-2.5 md:px-5">
              <Info className="h-4 w-4 shrink-0 text-warning" strokeWidth={1.75} />
              <p className="text-xs leading-relaxed text-warn-text">
                Large document — analysis based on first 25,000 characters. Full document review recommended
                before any compliance action.
              </p>
            </div>
          )}

          {/* Fields grid */}
          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 md:gap-3 md:p-4">
            <FieldCard
              icon={FileText}
              label="Legal framework"
              value={triage.legal_framework}
              className="sm:col-span-2"
            />
            <FieldCard
              icon={Building2}
              label="Issuing authority"
              value={triage.issuing_authority}
              sub={triage.jurisdiction}
            />
            <FieldCard icon={Clock} label="Response deadline" value={triage.response_deadline} />
            <FieldCard icon={Zap} label="Urgency">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyStyles(triage.urgency_level)}`}
              >
                {triage.urgency_level || '—'}
              </span>
            </FieldCard>
            <FieldCard icon={Database} label="Data scope" value={triage.data_scope} className="sm:col-span-2" />
            <FieldCard icon={GitBranch} label="Routing" sub={firstSentence(triage.routing_rationale)}>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${routingStyles(routing)}`}>
                {routing || '—'}
              </span>
            </FieldCard>
          </div>

          <SectionHeader label="Routing rationale" />
          <div className="mx-3 mb-3 rounded-lg border border-line bg-surface-primary p-3 md:mx-4 md:mb-4 md:p-4">
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)] md:text-sm">
              {triage.routing_rationale || '—'}
            </p>
          </div>

          <SectionHeader
            label="Red flags"
            count={redFlags.length > 0 ? `${redFlags.length} identified` : null}
            color={redFlags.length > 0 ? '#991b1b' : '#166534'}
          />

          {redFlags.length === 0 ? (
            <div className="mx-3 mb-4 flex items-center gap-3 rounded-lg border border-line bg-surface-primary p-4 md:mx-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-success" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium text-success">No red flags detected</p>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  This request appears legally compliant and properly formed.
                </p>
              </div>
            </div>
          ) : (
            redFlags.map((flag, i) => {
              const severity = flagSeverity(flag);
              return (
                <div
                  key={i}
                  className="mx-3 mb-2 rounded-r-lg border border-line border-l-[3px] border-l-danger-border bg-surface-primary p-3 last:mb-0 md:mx-4 md:p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-xs font-medium leading-snug text-danger md:text-sm">{flagTitle(flag)}</p>
                    <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${severity.className}`}>
                      {severity.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-secondary">{flag}</p>
                </div>
              );
            })
          )}

          {triage.truncated === true && redFlags.length > 0 && (
            <div className="mx-3 mb-4 mt-2 flex items-center gap-3 rounded-lg border border-warn-border bg-warning-light p-3 md:mx-4">
              <Info className="h-4 w-4 shrink-0 text-warning" strokeWidth={1.75} />
              <p className="text-xs leading-relaxed text-warn-text">
                Document truncated — full scope review recommended before compliance action.
              </p>
            </div>
          )}

          <div className="h-4 shrink-0 md:h-6" />
        </section>
      </div>

      <ResultsFooter analysisId={analysisMeta.id} generatedAt={analysisMeta.generatedAt} />
    </div>
  );
}
