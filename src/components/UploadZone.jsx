import { useCallback, useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';

const ACCEPTED = '.pdf,.docx,.txt';
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const FORMAT_BADGES = ['PDF', 'DOCX', 'TXT'];

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

  const onDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const openFilePicker = (e) => {
    e.stopPropagation();
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onClick={() => !disabled && !fileName && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          'rounded-xl border-2 border-dashed border-brand px-6 py-9 text-center transition-all',
          dragOver ? 'scale-[1.01] bg-brand-medium-30' : 'bg-brand-light',
          disabled ? 'pointer-events-none opacity-60' : '',
          fileName ? 'cursor-default' : 'cursor-pointer',
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
            <div className="flex size-13 items-center justify-center rounded-full bg-brand">
              <CloudUpload className="h-6 w-6 text-white" strokeWidth={1.75} />
            </div>
            <p className="text-base font-medium text-ink-primary">{fileName}</p>
            <button
              type="button"
              onClick={openFilePicker}
              className="text-sm text-brand hover:text-brand-dark"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <>
            <div className="mx-auto flex size-13 items-center justify-center rounded-full bg-brand">
              <CloudUpload className="h-6 w-6 text-white" strokeWidth={1.75} />
            </div>
            <p className="mt-3.5 text-base font-medium text-ink-primary">Drop your legal document here</p>
            <p className="mt-1 text-sm text-ink-muted">
              or{' '}
              <span
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') openFilePicker(e);
                }}
                className="cursor-pointer text-brand hover:text-brand-dark"
              >
                click to browse
              </span>{' '}
              your files
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {FORMAT_BADGES.map((fmt) => (
                <span
                  key={fmt}
                  className="rounded-full border border-brand-medium bg-white px-2.5 py-0.5 text-xs text-brand-dark"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
