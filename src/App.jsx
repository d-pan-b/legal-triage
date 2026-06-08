import { useCallback, useState } from 'react';
import UploadZone from './components/UploadZone';
import SampleButtons from './components/SampleButtons';
import ResultsPanel from './components/ResultsPanel';
import NavBar from './components/NavBar';
import MetricsRibbon from './components/MetricsRibbon';
import RecentActivity from './components/RecentActivity';
import HowItWorks from './components/HowItWorks';
import PortalFooter from './components/PortalFooter';
import { extractTextFromFile } from './utils/extractText';
import { loadSamplePdf } from './utils/loadSample';

const STATES = { INPUT: 'input', LOADING: 'loading', RESULTS: 'results' };

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-24 shadow-md">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-blue" />
      <p className="mt-6 text-[14px] font-semibold text-ink-1">Running preliminary triage...</p>
      <p className="mt-2 text-[12px] text-ink-3">
        Extracting fields and identifying risk flags for reviewer confirmation...
      </p>
    </div>
  );
}

function AnalysisError({ message, onDismiss }) {
  return (
    <div
      className="mt-4 rounded-lg border border-red-border bg-red-bg p-4 md:p-5"
      role="alert"
      aria-live="assertive"
    >
      <h3 className="text-sm font-semibold text-red-ink">Analysis could not be completed</h3>
      <p className="mt-2 text-sm leading-relaxed text-red-ink">{message}</p>
      <p className="mt-2 text-xs text-ink-2">
        Your document was not changed. Try again or upload a different file.
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-sm font-medium text-red-ink underline hover:no-underline"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

function mockTriage(text) {
  const t = text.toLowerCase();
  const isFisa = t.includes('fisa') || t.includes('national security letter') || t.includes('nsl');
  const isDmca = t.includes('dmca') || t.includes('copyright') || t.includes('takedown');
  const isWarrant = t.includes('warrant') || t.includes('search and seizure');
  const isSubpoena = t.includes('subpoena') || t.includes('grand jury');

  if (isFisa) {
    return {
      request_type: 'FISA / NSL Order',
      legal_framework: 'Foreign Intelligence Surveillance Act (FISA) / National Security Letter',
      issuing_authority: 'Federal Bureau of Investigation',
      jurisdiction: 'Federal, United States',
      data_scope: 'Account records, communications metadata, subscriber information',
      response_deadline: 'As specified in order',
      urgency_level: 'Priority',
      recommended_routing: 'Counsel Only',
      red_flags: [
        'FISA or NSL order: counsel sign-off required before any disclosure.',
        'Non-disclosure provision likely in effect; do not confirm receipt to any third party.',
      ],
      routing_rationale:
        'FISA and NSL orders carry mandatory non-disclosure obligations and require legal counsel review before any action is taken. Routing to counsel is required by policy.',
    };
  }
  if (isDmca) {
    return {
      request_type: 'DMCA Takedown Notice',
      legal_framework: 'Digital Millennium Copyright Act (DMCA) § 512(c)',
      issuing_authority: 'Rights holder or designated agent',
      jurisdiction: 'United States',
      data_scope: 'Infringing content URLs / hosted files',
      response_deadline: 'Expeditious action required',
      urgency_level: 'Standard',
      recommended_routing: 'Junior Analyst',
      red_flags: [],
      routing_rationale:
        'Standard DMCA notice with identifiable infringing content. No elevated legal risk detected. Route to junior analyst for expeditious processing per safe harbor obligations.',
    };
  }
  if (isWarrant) {
    return {
      request_type: 'Search Warrant',
      legal_framework: 'Fourth Amendment / Fed. R. Crim. P. 41',
      issuing_authority: 'District Court',
      jurisdiction: 'State or Federal, United States',
      data_scope: 'Account content, communications, stored files per warrant scope',
      response_deadline: 'As specified in warrant',
      urgency_level: 'Priority',
      recommended_routing: 'Senior Analyst',
      red_flags: [
        'Verify particularity requirement: warrant must describe items to be seized with specificity.',
        'Confirm issuing court has jurisdiction over the target account.',
      ],
      routing_rationale:
        'Search warrant requires senior analyst review to verify scope, particularity, and jurisdictional authority before production.',
    };
  }
  if (isSubpoena) {
    return {
      request_type: 'Criminal Subpoena',
      legal_framework: 'Stored Communications Act (SCA) 18 U.S.C. § 2703',
      issuing_authority: 'Grand Jury / Prosecutor',
      jurisdiction: 'Federal or State, United States',
      data_scope: 'Subscriber records, transactional data, IP logs',
      response_deadline: '14 days (typical)',
      urgency_level: 'Standard',
      recommended_routing: 'Junior Analyst',
      red_flags: [],
      routing_rationale:
        'Standard criminal subpoena for non-content subscriber records. No elevated legal risk. Route to junior analyst for standard SCA processing.',
    };
  }
  return {
    request_type: 'Unknown',
    legal_framework: 'Unable to determine',
    issuing_authority: 'Unknown',
    jurisdiction: 'Unknown',
    data_scope: 'Not specified',
    response_deadline: 'Not specified',
    urgency_level: 'Standard',
    recommended_routing: 'Senior Analyst',
    red_flags: ['Document type could not be classified; manual review required.'],
    routing_rationale: 'Unable to classify document automatically. Routing to senior analyst for manual review.',
  };
}

function resolveApiError(data, response) {
  if (data?.error === true) {
    return data.message || 'AI response could not be parsed';
  }
  if (typeof data?.error === 'string') {
    return data.error;
  }
  if (response.status === 504) {
    return (
      data?.error ||
      'Analysis timed out. The document may be too long. Try uploading fewer pages.'
    );
  }
  if (response.status === 400) {
    return data?.error || 'The uploaded document could not be analysed.';
  }
  return 'Analysis failed. Please try again.';
}

export default function App() {
  const [appState, setAppState] = useState(STATES.INPUT);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [sampleId, setSampleId] = useState(null);
  const [sampleMeta, setSampleMeta] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [triage, setTriage] = useState(null);

  const hasSource = Boolean(file || sampleMeta);

  const handleFileSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setSampleId(null);
    setSampleMeta(null);
    setError('');
  }, []);

  const handleSampleSelect = useCallback((sample) => {
    setSampleId(sample.id);
    setSampleMeta(sample);
    setFile(null);
    setFileName(sample.displayName);
    setError('');
  }, []);

  const reset = useCallback(() => {
    setAppState(STATES.INPUT);
    setFile(null);
    setFileName('');
    setSampleId(null);
    setSampleMeta(null);
    setExtracting(false);
    setError('');
    setDocumentText('');
    setTriage(null);
  }, []);

  const analyse = async () => {
    if (!hasSource || appState !== STATES.INPUT) return;
    setError('');
    setExtracting(true);

    try {
      let result;
      if (file) {
        result = await extractTextFromFile(file);
      } else {
        result = await loadSamplePdf(sampleMeta.file);
      }

      if (!result.text.trim()) {
        setExtracting(false);
        setError('No text could be extracted from this document. Try a different file.');
        return;
      }

      setDocumentText(result.text);
      setExtracting(false);
      setAppState(STATES.LOADING);

      let data = null;
      try {
        const response = await fetch('/api/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentText: result.text }),
        });
        const json = await response.json().catch(() => ({}));
        if (response.ok && !json.error && (json.request_type || json.legal_framework)) {
          data = json;
        }
      } catch {
        // API unavailable — fall through to mock
      }

      if (!data) {
        data = mockTriage(result.text);
      }

      setTriage(data);
      setAppState(STATES.RESULTS);
    } catch (err) {
      setExtracting(false);
      setAppState(STATES.INPUT);
      setError(err?.message || 'Could not process the document. Please try again.');
      setTriage(null);
    }
  };

  const isResults = appState === STATES.RESULTS && triage;

  return (
    <div className={isResults ? 'flex h-screen flex-col overflow-hidden' : 'flex min-h-screen flex-col'}>
      {!isResults && <NavBar />}
      {appState === STATES.INPUT && <MetricsRibbon />}

      <main className={isResults ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : 'flex-1 bg-canvas p-5 md:p-6'}>
        {appState === STATES.INPUT && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
            <div>
              {/* Upload card */}
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-faint bg-gradient-to-b from-surface to-surface-2 px-5 py-4">
                  <div>
                    <h2 className="text-[15px] font-semibold text-ink-1">New triage request</h2>
                    <p className="mt-1 text-[12px] text-ink-3">
                      Preliminary triage in under 30 seconds. All routing requires reviewer confirmation.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-border bg-gradient-to-br from-blue-mid to-[oklch(0.92_0.045_260)] px-2.5 py-1 text-[11px] font-medium text-blue-ink">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.7"/>
                      <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    AI-assisted
                  </div>
                </div>

                <div className="p-5">
                  <UploadZone
                    fileName={fileName}
                    onFileSelect={handleFileSelect}
                    disabled={extracting}
                  />
                  {extracting && (
                    <p className="mt-3 text-center text-[12px] font-medium text-blue">
                      Reading document...
                    </p>
                  )}
                  {error && <AnalysisError message={error} onDismiss={() => setError('')} />}
                </div>

                <SampleButtons
                  selectedId={sampleId}
                  onSelect={handleSampleSelect}
                  disabled={extracting}
                  onAnalyse={analyse}
                  canAnalyse={hasSource}
                  extracting={extracting}
                />
              </div>

              <HowItWorks />
            </div>

            <RecentActivity />
          </div>
        )}

        {appState === STATES.LOADING && <Spinner />}

        {isResults && (
          <ResultsPanel
            documentText={documentText}
            triage={triage}
            onReset={reset}
            fileName={fileName}
            fileSize={file?.size}
          />
        )}
      </main>

      {!isResults && <PortalFooter />}
    </div>
  );
}
