import { useMemo, useState, useRef, useEffect } from 'react';
import { Download, Maximize2, ArrowRight, UserCheck, RefreshCw, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ResultsNavBar from './ResultsNavBar';
import ResultsFooter from './ResultsFooter';

/* ── Tier helpers ─────────────────────────── */
function routingTier(routing) {
  const r = (routing || '').toLowerCase();
  if (r.includes('counsel')) return 'red';
  if (r.includes('senior'))  return 'amber';
  return 'blue';
}

function urgencyTier(level) {
  const u = (level || '').toLowerCase();
  if (u.includes('emergency')) return 'red';
  if (u.includes('priority'))  return 'amber';
  return 'blue';
}

const TIER_VERDICT_BG   = { red: 'bg-gradient-to-br from-red-mid to-red-bg',   amber: 'bg-gradient-to-br from-amber-mid to-amber-bg',   blue: 'bg-gradient-to-br from-blue-mid to-blue-bg'   };
const TIER_VERDICT_LABEL= { red: 'text-red-ink',  amber: 'text-amber-ink',  blue: 'text-blue-ink'  };
const TIER_ACCENT_LINE  = { red: 'bg-gradient-to-r from-red to-[oklch(0.50_0.22_30)]', amber: 'bg-gradient-to-r from-amber to-[oklch(0.62_0.14_80)]', blue: 'bg-gradient-to-r from-blue to-[oklch(0.52_0.18_262)]' };
const TIER_BTN          = { red: 'bg-gradient-to-b from-red to-red-hover',   amber: 'bg-gradient-to-b from-amber to-amber-hover',   blue: 'bg-gradient-to-b from-blue to-blue-hover'   };
const TIER_TAG          = { red: 'bg-red-mid text-red-ink border-red-border',   amber: 'bg-amber-mid text-amber-ink border-amber-border',   blue: 'bg-blue-mid text-blue-ink border-blue-border'   };

/* ── Severity helpers ──────────────────────── */
const FLAG_SEVERITY_RANK = { Critical: 0, High: 1, Medium: 2 };

function flagSeverity(flag) {
  const f = (flag || '').toLowerCase();
  if (f.includes('fourth amendment') || f.includes('particularity') || f.includes('civil liability') || f.includes('fisa') || f.includes('nsl'))
    return { label: 'Critical', rank: 0, tier: 'red' };
  if (f.includes('jurisdictional') || f.includes('nexus') || f.includes('overreach') || f.includes('attachment') || f.includes('overbroad'))
    return { label: 'High', rank: 1, tier: 'amber' };
  return { label: 'Medium', rank: 2, tier: 'blue' };
}

function sortFlags(flags) {
  return [...flags].sort((a, b) => flagSeverity(a).rank - flagSeverity(b).rank);
}

const FLAG_ROW_BG   = { red: 'bg-red-bg border-red-border',   amber: 'bg-amber-bg border-amber-border',   blue: 'bg-blue-bg border-blue-border'   };
const FLAG_SEV_COL  = { red: 'border-red-border',   amber: 'border-amber-border',   blue: 'border-blue-border'   };
const FLAG_ICON_BG  = { red: 'bg-red',   amber: 'bg-amber',   blue: 'bg-blue'   };
const FLAG_TITLE    = { red: 'text-red-ink',   amber: 'text-amber-ink',   blue: 'text-blue-ink'   };
const FLAG_PILL     = { red: 'bg-red-mid text-red-ink border-red-border',   amber: 'bg-amber-mid text-amber-ink border-amber-border',   blue: 'bg-blue-mid text-blue-ink border-blue-border'   };

/* ── Utilities ─────────────────────────────── */
function isSectionHeader(line) {
  const t = line.trim();
  if (t.length < 12 || t.replace(/[^A-Za-z]/g, '').length < 8) return false;
  return t === t.toUpperCase() || /^(YOU ARE|TO:|FROM:|RE:|SUBJECT:|IN THE MATTER|SEARCH AND|UNITED STATES)/i.test(t);
}
function estimatePages(text) { return Math.max(1, Math.ceil((text || '').length / 3000)); }
function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
function formatTimestamp(iso) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function flagTitle(flag) {
  const idx = flag.indexOf('.');
  if (idx > 0 && idx <= 80) return flag.slice(0, idx + 1);
  return flag.length > 80 ? `${flag.slice(0, 80)}...` : flag;
}
function primaryAction(tier) {
  if (tier === 'red')   return { label: 'Escalate to counsel', Icon: ArrowRight };
  if (tier === 'amber') return { label: 'Route to senior analyst', Icon: ArrowRight };
  return { label: 'Assign to analyst', Icon: UserCheck };
}
function receiptLabel(tier) {
  if (tier === 'red')   return 'Escalated to counsel';
  if (tier === 'amber') return 'Escalated to senior analyst';
  return 'Assigned to analyst queue';
}
function verdictTitle(tier) {
  if (tier === 'red')   return 'Counsel Only';
  if (tier === 'amber') return 'Senior Analyst';
  return 'Junior Analyst';
}

const COUNSEL_REASONS = [
  'Fourth Amendment / particularity concern',
  'FISA or NSL order: counsel sign-off required',
  'Missing legal basis or unsigned instrument',
  'Overbroad scope requires legal review',
  'Other (see notes)',
];

const UNKNOWN_VALUES = new Set(['unknown', 'unable to determine', 'not specified', 'n/a', '']);
function isUnknown(val) { return UNKNOWN_VALUES.has((val || '').toLowerCase().trim()); }

const OVERRIDE_TIERS = [
  { value: 'red',   label: 'Counsel Only',    desc: 'Requires legal counsel sign-off' },
  { value: 'amber', label: 'Senior Analyst',  desc: 'Requires senior analyst review'  },
  { value: 'blue',  label: 'Junior Analyst',  desc: 'Standard processing'             },
];

/* ── Sub-components ────────────────────────── */
function Tag({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-[5px] border px-2 py-0.5 text-[11px] font-medium leading-snug ${className}`}>
      {children}
    </span>
  );
}

function FieldCell({ label, children, className = '' }) {
  return (
    <div className={`bg-surface px-5 py-3 ${className}`}>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-3">{label}</div>
      <div className="break-words">{children}</div>
    </div>
  );
}

function FlagRow({ flag }) {
  const sev = flagSeverity(flag);
  return (
    <div className={`grid border-b ${FLAG_ROW_BG[sev.tier]}`} style={{ gridTemplateColumns: '52px 1fr 80px' }}>
      <div className={`flex flex-col items-center justify-start gap-1.5 border-r pt-3 ${FLAG_SEV_COL[sev.tier]}`}>
        <div className={`flex h-[22px] w-[22px] items-center justify-center rounded-[5px] ${FLAG_ICON_BG[sev.tier]}`}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M8 3L2 14h12L8 3z" /><path d="M8 7v3" /><circle cx="8" cy="12.5" r="0.8" fill="white" />
          </svg>
        </div>
      </div>
      <div className="px-3 py-3">
        <p className={`mb-1 text-[12.5px] font-semibold leading-snug ${FLAG_TITLE[sev.tier]}`}>{flagTitle(flag)}</p>
        <p className="text-[11.5px] leading-relaxed text-ink-2">{flag}</p>
      </div>
      <div className="flex items-start justify-end px-3 pt-3">
        <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${FLAG_PILL[sev.tier]}`}>
          {sev.label}
        </span>
      </div>
    </div>
  );
}

function RoutingGate({ reason, notes, onReasonChange, onNotesChange, onSubmit, onCancel, closing }) {
  const firstRadioRef = useRef(null);
  const notesMax = 500;
  const notesRemaining = notesMax - notes.length;

  useEffect(() => { firstRadioRef.current?.focus(); }, []);

  return (
    <div
      className="routing-gate mx-4 my-3 overflow-hidden rounded-xl border border-border bg-surface shadow-md"
      data-closing={closing ? 'true' : undefined}
      role="region"
      aria-label="Escalation confirmation"
    >
      <div className="border-b border-border-faint bg-gradient-to-b from-surface to-surface-2 px-4 py-3">
        <h3 className="text-[13px] font-semibold text-ink-1">Confirm escalation to counsel</h3>
        <p className="mt-0.5 text-[11.5px] text-ink-3">
          Select a reason before confirming. Your decision is the final routing action and will be recorded in the audit log.
        </p>
      </div>

      <div className="px-4 pt-3">
        <fieldset className="mb-3">
          <legend className="mb-2.5 text-[11px] font-semibold text-ink-2">
            Escalation reason <span className="text-red-ink" aria-label="required">*</span>
          </legend>
          <div className="space-y-2">
            {COUNSEL_REASONS.map((r, i) => (
              <label key={r} className="flex cursor-pointer items-start gap-2.5">
                <input
                  ref={i === 0 ? firstRadioRef : undefined}
                  type="radio"
                  name="counsel-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => onReasonChange(r)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-blue"
                />
                <span className="text-[12.5px] leading-relaxed text-ink-2">{r}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="counsel-notes" className="text-[11px] font-semibold text-ink-2">
              Notes <span className="font-normal text-ink-4">(optional)</span>
            </label>
            <span className={`text-[11px] ${notesRemaining < 50 ? 'text-amber-ink' : 'text-ink-4'}`} aria-live="polite">
              {notesRemaining} remaining
            </span>
          </div>
          <textarea
            id="counsel-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value.slice(0, notesMax))}
            rows={3}
            placeholder="Add context for counsel..."
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-[12.5px] leading-relaxed text-ink-1 placeholder:text-ink-4 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border-faint bg-surface-2 px-4 py-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!reason}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-blue to-blue-hover px-3 py-2 text-[12px] font-semibold text-white shadow-[0_1px_2px_oklch(0_0_0/0.2),inset_0_1px_0_oklch(1_0_0/0.15)] transition-all motion-safe:active:scale-[0.97] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />
          Confirm escalation to counsel
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[12px] text-ink-3 underline underline-offset-2 hover:text-ink-2 hover:no-underline"
        >
          Return to review
        </button>
      </div>
    </div>
  );
}

function OverrideForm({ currentTier, onSubmit, onCancel }) {
  const [newTier, setNewTier] = useState('');
  const [reason, setReason] = useState('');
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  return (
    <div
      className="mx-4 my-3 overflow-hidden rounded-xl border border-amber-border bg-amber-bg shadow-sm"
      role="region"
      aria-label="Override routing"
    >
      <div className="border-b border-amber-border bg-gradient-to-b from-amber-bg to-amber-mid px-4 py-3">
        <h3 className="text-[13px] font-semibold text-amber-ink">Override suggested routing</h3>
        <p className="mt-0.5 text-[11.5px] text-ink-3">
          Preliminary suggestion: <strong>{verdictTitle(currentTier)}</strong>. Select a different routing tier and provide an override reason; both will be recorded in the audit log.
        </p>
      </div>

      <div className="px-4 pt-3">
        <fieldset className="mb-3">
          <legend className="mb-2 text-[11px] font-semibold text-ink-2">
            New routing tier <span className="text-red-ink" aria-label="required">*</span>
          </legend>
          <div className="space-y-2">
            {OVERRIDE_TIERS.filter((t) => t.value !== currentTier).map((t, i) => (
              <label key={t.value} className="flex cursor-pointer items-start gap-2.5">
                <input
                  ref={i === 0 ? firstRef : undefined}
                  type="radio"
                  name="override-tier"
                  value={t.value}
                  checked={newTier === t.value}
                  onChange={() => setNewTier(t.value)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-blue"
                />
                <span className="text-[12.5px] leading-relaxed text-ink-2">
                  <span className="font-semibold">{t.label}</span>
                  <span className="ml-1 text-ink-4">({t.desc})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mb-3">
          <label htmlFor="override-reason" className="mb-1.5 block text-[11px] font-semibold text-ink-2">
            Override reason <span className="text-red-ink" aria-label="required">*</span>
          </label>
          <input
            id="override-reason"
            type="text"
            value={reason}
            maxLength={200}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Confirmed with counsel: escalation not required"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[12.5px] text-ink-1 placeholder:text-ink-4 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-amber-border bg-amber-bg px-4 py-3">
        <button
          type="button"
          onClick={() => onSubmit(newTier, reason)}
          disabled={!newTier || !reason.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-amber to-amber-hover px-3 py-2 text-[12px] font-semibold text-white shadow-[0_1px_2px_oklch(0_0_0/0.2),inset_0_1px_0_oklch(1_0_0/0.12)] transition-all motion-safe:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply override
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[12px] text-ink-3 underline underline-offset-2 hover:text-ink-2 hover:no-underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function RoutingReceipt({ record, tier, onExport, onReset }) {
  return (
    <div
      className="routing-receipt mx-4 my-3 overflow-hidden rounded-xl border border-green-border bg-green-bg shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 border-b border-green-border bg-gradient-to-b from-green-bg to-[oklch(0.930_0.070_145)] px-4 py-3">
        <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-green text-white shadow-[0_1px_3px_var(--green)]">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M3 8l4 4 6-7" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-green-ink">{receiptLabel(tier)}</span>
      </div>
      <div className="px-4 py-3">
        <p className="font-mono text-[11px] text-ink-3">{formatTimestamp(record.timestamp)} · {record.analysisId}</p>
        {record.reason && <p className="mt-1.5 text-[12px] text-ink-2">Reason: {record.reason}</p>}
        {record.override && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-ink">
            <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            Override: AI suggested {verdictTitle(record.override.from)}, reviewer confirmed {verdictTitle(record.override.to)}
            {record.override.reason && ` (${record.override.reason})`}
          </p>
        )}
        {record.notes && (
          <p className="mt-2 rounded-lg border border-border bg-surface px-3 py-2 text-[12px] italic leading-relaxed text-ink-3">
            {record.notes}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-green-border px-4 py-2.5">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px] text-ink-2 shadow-sm transition-all hover:shadow-md motion-safe:active:scale-[0.97]"
        >
          <Download className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          Download record
        </button>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-ink-3 underline underline-offset-2 hover:text-ink-2 hover:no-underline"
        >
          New analysis
        </button>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────── */
export default function ResultsPanel({ documentText, triage, onReset, fileName = 'Document', fileSize }) {
  const containerRef = useRef(null);
  useEffect(() => { containerRef.current?.focus(); }, []);

  const [analysisMeta] = useState(() => ({
    id: `TRG-${Date.now()}`,
    generatedAt: new Date().toLocaleString(),
  }));

  const [routingStatus, setRoutingStatus] = useState('idle');
  const [routingRecord, setRoutingRecord] = useState(null);
  const [counselReason, setCounselReason] = useState('');
  const [counselNotes, setCounselNotes] = useState('');
  const [routingError, setRoutingError] = useState('');
  const [gateClosing, setGateClosing] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideTier, setOverrideTier] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const redFlags = useMemo(() => sortFlags(Array.isArray(triage.red_flags) ? triage.red_flags : []), [triage.red_flags]);
  const routing  = triage.recommended_routing || '';
  const tier     = routingTier(routing);
  const urgTier  = urgencyTier(triage.urgency_level);

  const effectiveTier = overrideTier || tier;
  const effectiveIsCounselOnly = effectiveTier === 'red';
  const { label: primaryLabel, Icon: PrimaryIcon } = primaryAction(effectiveTier);

  const unknownCount = [triage.request_type, triage.legal_framework, triage.issuing_authority, triage.jurisdiction]
    .filter(isUnknown).length;
  const isLowConfidence = unknownCount >= 2 || isUnknown(triage.request_type);

  const docLines  = useMemo(() => (documentText || '').split('\n'), [documentText]);
  const pageCount = estimatePages(documentText);
  const sizeLabel = formatFileSize(fileSize);
  const metaParts = [fileName, sizeLabel, `${pageCount} pages`].filter(Boolean);

  const isGateOpen = routingStatus === 'gate_open';
  const isInFlight = routingStatus === 'in_flight';
  const isActioned = routingStatus === 'actioned';
  const isError    = routingStatus === 'error';

  const overridePayload = overrideTier
    ? { override: { from: tier, to: overrideTier, reason: overrideReason } }
    : {};

  const handleRoutingAction = () => {
    if (routingStatus !== 'idle') return;
    if (effectiveIsCounselOnly) {
      setRoutingStatus('gate_open');
    } else {
      setRoutingStatus('in_flight');
      setTimeout(() => {
        setRoutingRecord({ path: routing, reason: null, notes: null, timestamp: new Date().toISOString(), analysisId: analysisMeta.id, ...overridePayload });
        setRoutingStatus('actioned');
      }, 600);
    }
  };

  const handleGateSubmit = () => {
    if (!counselReason || routingStatus === 'in_flight') return;
    setRoutingStatus('in_flight');
    setTimeout(() => {
      setRoutingRecord({ path: routing, reason: counselReason, notes: counselNotes.trim() || null, timestamp: new Date().toISOString(), analysisId: analysisMeta.id, ...overridePayload });
      setRoutingStatus('actioned');
    }, 600);
  };

  const handleGateCancel = () => {
    setGateClosing(true);
    setTimeout(() => { setCounselReason(''); setCounselNotes(''); setGateClosing(false); setRoutingStatus('idle'); }, 150);
  };

  const handleDownload = () => {
    const blob = new Blob([documentText], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: fileName.replace(/\.[^.]+$/, '') + '.txt' });
    a.click(); URL.revokeObjectURL(url);
  };

  const handleFullView = () => {
    const w = window.open('', '_blank');
    if (w) { w.document.write(`<pre style="font-family:Georgia,serif;padding:2rem;white-space:pre-wrap;line-height:1.6">${documentText.replace(/</g, '&lt;')}</pre>`); w.document.close(); }
  };

  const handleExport = () => {
    const data = { ...triage, ...(routingRecord ? { routing_record: routingRecord } : {}) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `triage-report-${analysisMeta.id}.json` });
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div ref={containerRef} tabIndex={-1} className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none">
      <ResultsNavBar />

      <div className="grid min-h-0 flex-1 grid-rows-2 overflow-hidden lg:grid-cols-2 lg:grid-rows-1">

        {/* ── Left pane — document ── */}
        <section aria-label="Original document" className="flex min-h-0 flex-col overflow-hidden border-b border-border-strong bg-surface lg:border-b-0 lg:border-r">
          <div className="flex shrink-0 items-center justify-between border-b border-border-faint bg-gradient-to-b from-surface to-surface-2 px-5 py-3">
            <div>
              <h2 className="text-[13px] font-semibold text-ink-1">Original document</h2>
              <p className="mt-0.5 font-mono text-[11px] text-ink-4">{metaParts.join(' · ')}</p>
            </div>
            <div className="flex gap-1.5">
              {[
                { icon: Download, label: 'Download', onClick: handleDownload },
                { icon: Maximize2, label: 'Full view', onClick: handleFullView },
              ].map(({ icon: Icon, label, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-[11px] text-ink-2 shadow-sm transition-all hover:shadow-md motion-safe:active:scale-[0.97]"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            {!documentText?.trim() ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.25" className="mb-3 opacity-60">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
                </svg>
                <p className="text-[13px] font-semibold text-ink-2">No document text available</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
                  The file contained no extractable text. Triage is based on metadata only.
                </p>
              </div>
            ) : (
              <div className="text-[13px] leading-relaxed text-ink-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {docLines.map((line, i) =>
                  isSectionHeader(line) ? (
                    <p key={i} className="mb-1 mt-4 font-sans text-[10px] font-bold uppercase tracking-[0.07em] text-ink-4">
                      {line}
                    </p>
                  ) : (
                    <p key={i} className="mb-1">{line || ' '}</p>
                  )
                )}
              </div>
            )}
            {triage.truncated === true && (
              <div className="mt-4 rounded-lg border border-red-border bg-red-bg p-3">
                <p className="font-sans text-[11px] font-semibold text-red-ink">Document truncated here</p>
                <p className="mt-0.5 font-sans text-[11px] leading-relaxed text-ink-2">
                  Analysis based on content above this point only.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Right pane — triage ── */}
        <section aria-label="Triage analysis" className="flex min-h-0 flex-col overflow-hidden bg-surface-2">

          {/* Verdict bar */}
          <div className="shrink-0">
            <div className={`h-[3px] ${TIER_ACCENT_LINE[tier]}`} />
            <div className={`px-5 pb-4 pt-4 ${TIER_VERDICT_BG[tier]}`}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                Suggested routing
              </p>
              <h1 className={`mb-3 text-[26px] font-bold leading-none tracking-tight ${TIER_VERDICT_LABEL[tier]}`}>
                {verdictTitle(tier)}
              </h1>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Tag className="border-border bg-surface text-ink-2">{triage.request_type || 'Unknown'}</Tag>
                <Tag className={TIER_TAG[urgTier]}>{triage.urgency_level || '—'}</Tag>
                <Tag className={TIER_TAG[tier]}>
                  {redFlags.length === 0 ? 'No flags' : `${redFlags.length} red flag${redFlags.length > 1 ? 's' : ''}`}
                </Tag>
              </div>
              <p className="text-[13px] leading-relaxed text-ink-2">{triage.routing_rationale || '—'}</p>
            </div>

            {/* Action strip */}
            {!isActioned && (
              <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-5 py-3">
                <button
                  type="button"
                  onClick={handleRoutingAction}
                  disabled={isInFlight || isGateOpen}
                  aria-busy={isInFlight}
                  className={`flex h-[34px] items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold text-white shadow-[0_1px_3px_oklch(0_0_0/0.2),inset_0_1px_0_oklch(1_0_0/0.15)] transition-all hover:brightness-110 motion-safe:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${TIER_BTN[effectiveTier]}`}
                >
                  {isInFlight ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin [animation-duration:500ms] motion-reduce:animate-none" strokeWidth={2} />Recording...</>
                  ) : (
                    <><PrimaryIcon className="h-3.5 w-3.5" strokeWidth={2} />{primaryLabel}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isInFlight}
                  className="flex h-[34px] items-center gap-1.5 rounded-lg border border-border bg-surface px-4 text-[13px] text-ink-1 shadow-sm transition-all hover:shadow-md motion-safe:active:scale-[0.97] disabled:opacity-50"
                >
                  Export report
                </button>
                {!isGateOpen && (
                  <button
                    type="button"
                    onClick={onReset}
                    disabled={isInFlight}
                    className="flex h-[34px] items-center rounded-lg border border-border-faint px-3 text-[13px] text-ink-3 transition-all hover:border-border hover:text-ink-2 motion-safe:active:scale-[0.97] disabled:opacity-50"
                  >
                    New analysis
                  </button>
                )}
                {!isGateOpen && !overrideOpen && routingStatus === 'idle' && (
                  <button
                    type="button"
                    onClick={() => setOverrideOpen(true)}
                    className="flex h-[34px] items-center rounded-lg border border-border-faint px-3 text-[12px] text-ink-4 transition-all hover:border-border hover:text-ink-3 motion-safe:active:scale-[0.97]"
                  >
                    Override routing
                  </button>
                )}
                {overrideTier && !overrideOpen && (
                  <span className="flex items-center gap-1.5 rounded-md border border-amber-border bg-amber-bg px-2.5 py-1 text-[11px] text-amber-ink">
                    <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                    Overridden to {verdictTitle(overrideTier)}
                  </span>
                )}
                {isError && (
                  <div className="mt-2 flex w-full items-start gap-2 rounded-lg border border-red-border bg-red-bg px-3 py-2" role="alert">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-ink" strokeWidth={2} />
                    <p className="flex-1 text-[12px] leading-relaxed text-red-ink">
                      {routingError || 'Routing could not be recorded. Export the report manually.'}
                    </p>
                    <button type="button" onClick={() => { setRoutingStatus('idle'); setRoutingError(''); }} className="text-[11px] text-red-ink underline">Dismiss</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {triage.truncated === true && (
            <div className="flex shrink-0 items-center gap-2.5 border-b border-amber-border bg-amber-bg px-5 py-2.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--amber-ink)" strokeWidth="1.75"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10.5v.5"/></svg>
              <p className="text-[12px] leading-relaxed text-amber-ink">
                Large document: triage based on the first 25,000 characters only. Full document review is recommended before confirming any routing action.
              </p>
            </div>
          )}

          {isLowConfidence && (
            <div className="flex shrink-0 items-center gap-2.5 border-b border-amber-border bg-amber-bg px-5 py-2.5" role="alert">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-ink" strokeWidth={1.75} />
              <p className="text-[12px] leading-relaxed text-amber-ink">
                Low confidence: several fields could not be extracted automatically. Additional manual review is recommended before confirming routing.
              </p>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

            {/* Field grid */}
            <div className="grid grid-cols-2 border-b border-border bg-surface">
              <FieldCell label="Legal framework" className="col-span-2 border-b border-border-faint">
                <p className="text-[13px] font-medium text-ink-1">{triage.legal_framework || '—'}</p>
              </FieldCell>
              <FieldCell label="Issuing authority" className="border-b border-r border-border-faint">
                <p className="text-[13px] font-medium text-ink-1">{triage.issuing_authority || '—'}</p>
                {triage.jurisdiction && <p className="mt-0.5 text-[11px] text-ink-3">{triage.jurisdiction}</p>}
              </FieldCell>
              <FieldCell
                label="Response deadline"
                className={`border-b border-border-faint ${urgTier === 'red' ? 'bg-red-bg' : ''}`}
              >
                <p className={`font-mono text-[12px] font-medium ${urgTier === 'red' ? 'font-semibold text-red-ink' : 'text-ink-1'}`}>
                  {triage.response_deadline || '—'}
                </p>
              </FieldCell>
              <FieldCell label="Urgency" className="border-b border-r border-border-faint">
                <Tag className={`mt-1 ${TIER_TAG[urgTier]}`}>{triage.urgency_level || '—'}</Tag>
              </FieldCell>
              <FieldCell label="Routing tier" className="border-b border-border-faint">
                <Tag className={`mt-1 ${TIER_TAG[tier]}`}>{routing || '—'}</Tag>
              </FieldCell>
              <FieldCell
                label="Data scope"
                className={`col-span-2 ${
                  (triage.data_scope || '').toLowerCase().includes('overbroad') ? 'bg-amber-bg' : ''
                }`}
              >
                <p className={`text-[13px] font-medium ${
                  (triage.data_scope || '').toLowerCase().includes('overbroad') ? 'text-amber-ink' : 'text-ink-1'
                }`}>
                  {triage.data_scope || '—'}
                </p>
              </FieldCell>
            </div>

            {/* Red flags */}
            <SectionHeader
              label="Red flags"
              count={redFlags.length === 0 ? 'None identified' : `${redFlags.length} identified`}
              tier={redFlags.length === 0 ? 'green' : redFlags.length > 1 ? 'red' : 'amber'}
            />

            {redFlags.length === 0 ? (
              <div className="flex items-center gap-3 border-b border-border-faint bg-green-bg px-5 py-4">
                <CheckCircle className="h-4 w-4 shrink-0 text-green-ink" strokeWidth={1.75} />
                <div>
                  <p className="text-[13px] font-semibold text-green-ink">No issues flagged in preliminary screening</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-3">Verify compliance independently before confirming routing.</p>
                </div>
              </div>
            ) : (
              <div className="border-b border-border">
                {redFlags.map((flag, i) => <FlagRow key={i} flag={flag} />)}
              </div>
            )}

            {/* Override form */}
            {overrideOpen && (
              <OverrideForm
                currentTier={tier}
                onSubmit={(newTier, reason) => {
                  setOverrideTier(newTier);
                  setOverrideReason(reason);
                  setOverrideOpen(false);
                }}
                onCancel={() => setOverrideOpen(false)}
              />
            )}

            {/* Gate / Receipt */}
            {isActioned && routingRecord ? (
              <RoutingReceipt record={routingRecord} tier={effectiveTier} onExport={handleExport} onReset={onReset} />
            ) : (isGateOpen || gateClosing) ? (
              <RoutingGate
                reason={counselReason}
                notes={counselNotes}
                onReasonChange={setCounselReason}
                onNotesChange={setCounselNotes}
                onSubmit={handleGateSubmit}
                onCancel={handleGateCancel}
                closing={gateClosing}
              />
            ) : null}

            <div className="h-6 shrink-0" />
          </div>
        </section>
      </div>

      <ResultsFooter analysisId={analysisMeta.id} generatedAt={analysisMeta.generatedAt} />
    </div>
  );
}
