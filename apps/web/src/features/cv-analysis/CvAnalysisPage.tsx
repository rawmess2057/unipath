import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Dropzone } from '../../components/ui/Dropzone';
import { Card } from '../../components/ui/Card';
import { useUploadCv, useCvAnalysis } from '../../hooks/useCvAnalysis';
import { useProfile } from '../../hooks/useProfile';

type AnalysisStatus = 'upload' | 'processing' | 'results';

export function CvAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('upload');
  const { data: profile } = useProfile();
  const uploadMutation = useUploadCv();
  const { data: result, isLoading: resultLoading } = useCvAnalysis(analysisId);

  const handleFile = (f: File) => {
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const res = await uploadMutation.mutateAsync({
        file,
        targetIndustry: (profile as any)?.targetIndustry ?? 'tech',
        fieldOfStudy: (profile as any)?.fieldOfStudy ?? '',
      });
      const data = res.data ?? res;
      setAnalysisId(data.id);
    } catch {
      setStatus('upload');
    }
  };

  const analysisResult = result?.status === 'completed' ? result : null;

  useEffect(() => {
    if (analysisResult) {
      setStatus('results');
    }
  }, [analysisResult]);

  if (status === 'processing') {
    return (
      <div className="animate-fadeIn mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">CV Analysis</h1>
        <Card className="flex flex-col items-center py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
          <h3 className="mt-4 text-lg font-medium text-slate-800">Analyzing your CV...</h3>
          <p className="mt-1 text-sm text-slate-500">This usually takes 10-30 seconds.</p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-2">
            {['Extracting text', 'Checking quality', 'AI analysis'].map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className={`h-6 w-6 rounded-full ${i < 2 ? 'bg-success-100 text-success-600' : 'bg-brand-100 text-brand-600'} flex items-center justify-center text-xs font-medium`}>
                  {i < 2 ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <span className={i < 2 ? 'text-slate-500' : 'font-medium text-slate-800'}>{step}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (analysisResult) {
    const categories = [
      { label: 'Structure', score: analysisResult.structureScore, color: 'bg-blue-500' },
      { label: 'Keywords', score: analysisResult.keywordsScore, color: 'bg-amber-500' },
      { label: 'Clarity', score: analysisResult.clarityScore, color: 'bg-emerald-500' },
      { label: 'UK Conventions', score: analysisResult.ukConventionsScore, color: 'bg-rose-500' },
    ];

    const feedbackItems = [
      ...(analysisResult.structure?.feedback ?? []).map((f: any) => ({ ...f, category: 'Structure' })),
      ...(analysisResult.keywords?.feedback ?? []).map((f: any) => ({ ...f, category: 'Keywords' })),
      ...(analysisResult.clarity?.feedback ?? []).map((f: any) => ({ ...f, category: 'Clarity' })),
      ...(analysisResult.uk_conventions?.feedback ?? []).map((f: any) => ({ ...f, category: 'UK Conventions' })),
    ];

    const sevIcon: Record<string, any> = { critical: XCircle, important: AlertTriangle, minor: Info };
    const sevClass: Record<string, string> = {
      critical: 'border-danger-200 bg-danger-50 text-danger-600',
      important: 'border-warning-200 bg-warning-50 text-warning-600',
      minor: 'border-brand-200 bg-brand-50 text-brand-600',
    };

    return (
      <div className="animate-fadeIn mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">CV Analysis Results</h1>

        <Card>
          <p className="text-sm text-slate-600">{analysisResult.overallSummary}</p>
          {analysisResult.strengths?.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-slate-800">Strengths</h4>
              {analysisResult.strengths.map((s: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                  {s}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <Card key={cat.label}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                  <span className="font-medium text-slate-800">{cat.label}</span>
                </div>
                <span className={`text-sm font-medium ${(cat.score ?? 0) >= 15 ? 'text-success-600' : (cat.score ?? 0) >= 10 ? 'text-warning-600' : 'text-slate-500'}`}>
                  {cat.score ?? '--'}/25
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          {feedbackItems.map((item: any, i: number) => {
            const Icon = sevIcon[item.severity] ?? Info;
            const classes = sevClass[item.severity] ?? sevClass.minor;
            return (
              <div key={i} className={`rounded-lg border p-3 ${classes}`}>
                <div className="flex gap-2">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.issue}</p>
                    <p className="mt-1 text-xs opacity-80">{item.suggestion}</p>
                    {item.example_from_cv && (
                      <p className="mt-1 rounded bg-white/50 px-2 py-1 text-xs italic">{item.example_from_cv}</p>
                    )}
                    {item.uk_standard && (
                      <p className="mt-1 text-xs">UK Standard: {item.uk_standard}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-slate-50 p-4 text-center">
          <p className="text-xs text-slate-500">
            Your CV Quality score powers your overall Employability Score behind the scenes.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => { setAnalysisId(null); setFile(null); setStatus('upload'); }}
            className="text-sm font-medium text-brand-600 hover:text-brand-800"
          >
            &larr; Analyze another CV
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">CV Analysis</h1>
      <p className="text-sm text-slate-500">Upload your CV for AI-powered feedback.</p>

      <Dropzone onFile={handleFile} />

      {file && (
        <div className="text-center">
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Analyze CV'}
          </button>
          {uploadMutation.isError && (
            <p className="mt-2 text-sm text-danger-600">{(uploadMutation.error as Error)?.message ?? 'Upload failed'}</p>
          )}
        </div>
      )}
    </div>
  );
}
