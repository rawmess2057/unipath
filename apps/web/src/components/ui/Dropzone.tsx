import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useState, useRef, type DragEvent } from 'react';

interface DropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  maxSize?: number;
  error?: string | null;
}

export function Dropzone({ onFile, accept = '.pdf', maxSize = 5, error: externalError }: DropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const error = externalError ?? internalError;

  const validate = (f: File) => {
    setInternalError(null);
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setInternalError('Only PDF files are accepted.');
      return false;
    }
    if (f.size > maxSize * 1024 * 1024) {
      setInternalError(`File must be under ${maxSize}MB.`);
      return false;
    }
    return true;
  };

  const handleFile = (f: File) => {
    if (validate(f)) {
      setFile(f);
      onFile(f);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div
      className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
        error
          ? 'border-danger-400/50 bg-danger-500/10'
          : dragOver
            ? 'border-brand-400 bg-brand-500/10'
            : 'border-white/10 hover:border-brand-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {file && !error ? (
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-success-500/20 p-3">
            <FileText className="h-8 w-8 text-success-300" />
          </div>
          <p className="font-medium text-brand-100">{file.name}</p>
          <p className="text-xs text-brand-200/60">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
        </div>
      ) : (
        <>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20">
            <Upload className="h-8 w-8 text-brand-300" />
          </div>
          <p className="font-medium text-brand-100">Drag & drop your CV here</p>
          <p className="mb-4 text-sm text-brand-200">or click to browse</p>
          <div className="flex items-center justify-center gap-4 text-xs text-brand-200/60">
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> PDF only</span>
            <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Max {maxSize}MB</span>
          </div>
        </>
      )}

      {error && <p className="mt-4 text-sm text-danger-400">{error}</p>}
    </div>
  );
}
