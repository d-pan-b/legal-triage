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
    <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface-primary py-24">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-brand" />
      <p className="mt-6 text-base font-medium text-ink-primary">Analysing request...</p>
      <p className="mt-2 text-xs text-ink-muted md:text-sm">
        Extracting fields and classifying legal basis...
      </p>
    </div>
  );
}

function AnalysisError({ message, onDismiss }) {
  return (
    <div
      className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 md:p-5"
      role="alert"
    >
      <h3 className="text-sm font-medium text-red-900">Analysis could not be completed</h3>
      <p className="mt-2 text-sm leading-relaxed text-red-800">{message}</p>
      <p className="mt-2 text-xs text-red-700">
        Your document was not changed. You can try again or upload a different file.
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-sm font-medium text-red-900 underline hover:no-underline"
        >
          Dismiss
        </button>
      )}
    </div>
  );
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
      'Analysis timed out — document may be too long. Try uploading fewer pages.'
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

  const handleSampleSelect = useCallback(async (sample) => {
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
    if (!hasSource) return;
    setError('');
    setExtracting(true);

    try {
      let result;
      if (file) {
        result = await extractTextFromFile(file);
      } else {
        result = await loadSamplePdf(sampleMeta.file);
      }

      setDocumentText(result.text);
      setExtracting(false);
      setAppState(STATES.LOADING);

      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: result.text }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || data.error === true) {
        throw new Error(resolveApiError(data, response));
      }

      if (!data.request_type && !data.legal_framework) {
        throw new Error(
          'Received an incomplete analysis response. Please try again.'
        );
      }

      setTriage(data);
      setAppState(STATES.RESULTS);
    } catch (err) {
      setExtracting(false);
      setAppState(STATES.INPUT);
      setTriage(null);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const isResults = appState === STATES.RESULTS && triage;

  return (
    <div
      className={
        isResults ? 'flex h-screen flex-col overflow-hidden' : 'flex min-h-screen flex-col'
      }
    >
      {!isResults && <NavBar />}
      {appState === STATES.INPUT && <MetricsRibbon />}

      <main
        className={
          isResults
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
            : 'flex-1 bg-portal-surface p-4 md:p-6'
        }
      >
        {appState === STATES.INPUT && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_17.5rem]">
            <div>
              <div className="overflow-hidden rounded-xl border border-line bg-surface-primary">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-4 md:px-6 md:py-5">
                  <div>
                    <h2 className="text-base font-medium text-ink-primary">New triage request</h2>
                    <p className="mt-0.5 text-xs text-ink-muted md:text-sm">
                      AI-assisted classification and routing in under 30 seconds
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs text-brand-dark">
                    AI-powered
                  </span>
                </div>

                <div className="p-4 md:p-6">
                  <UploadZone
                    fileName={fileName}
                    onFileSelect={handleFileSelect}
                    disabled={extracting}
                  />

                  {extracting && (
                    <p className="mt-3 text-center text-xs font-medium text-brand md:text-sm">
                      Reading document...
                    </p>
                  )}

                  {error && (
                    <AnalysisError message={error} onDismiss={() => setError('')} />
                  )}

                  <SampleButtons
                    selectedId={sampleId}
                    onSelect={handleSampleSelect}
                    disabled={extracting}
                    onAnalyse={analyse}
                    canAnalyse={hasSource}
                    extracting={extracting}
                  />
                </div>
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
