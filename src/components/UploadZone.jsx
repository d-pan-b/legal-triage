import { useCallback, useRef, useState } from 'react';

const ACCEPTED = '.pdf,.docx,.txt';
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

function isAccepted(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['pdf', 'docx', 'txt'].includes(ext) || ACCEPTED_MIME.includes(file.type);
}

export default function UploadZone({ fileName, onFileSelect, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!isAccepted(file)) {
        setError('Please upload a .pdf, .docx, or .txt file.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('File exceeds the 20 MB limit. Please upload a smaller file.');
        return;
      }
      setError('');
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      handleFile(e.dataTransfer.files?.[0]);
    },
    [disabled, handleFile]
  );

  const openFilePicker = (e) => {
    e?.stopPropagation();
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={fileName ? `Selected file: ${fileName}. Press Enter to change.` : 'Upload a document. Press Enter or Space to browse files.'}
        aria-disabled={disabled}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onClick={() => !disabled && !fileName && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={[
          'rounded-lg border-[1.5px] border-dashed px-6 py-9 text-center transition-[border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2',
          dragOver
            ? 'border-blue bg-blue-bg'
            : 'border-border-strong bg-surface-2 hover:border-blue hover:bg-blue-bg',
          disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {fileName ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-ink-1">{fileName}</p>
            <button
              type="button"
              onClick={openFilePicker}
              className="text-[12px] font-medium text-blue hover:text-blue-hover focus-visible:outline-none focus-visible:rounded focus-visible:ring-1 focus-visible:ring-blue"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="mt-3.5 text-[14px] font-semibold text-ink-1">
              Drop a document here, or{' '}
              <span
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFilePicker(e); }}
                className="cursor-pointer font-semibold text-blue hover:text-blue-hover focus-visible:outline-none focus-visible:rounded focus-visible:ring-1 focus-visible:ring-blue"
              >
                browse files
              </span>
            </p>
            <p className="mt-1.5 text-[12px] text-ink-3">
              Securely processed. Document stays on your network.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['PDF', 'DOCX', 'TXT', 'Up to 20 MB'].map((fmt) => (
                <span
                  key={fmt}
                  className="rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] font-medium text-ink-3"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-[12px] text-red-ink" role="alert">{error}</p>}
    </div>
  );
}
