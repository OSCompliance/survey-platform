import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { usePolling } from '../hooks/usePolling';
import { DistrictBarChart } from '../components/charts/DistrictBarChart';
import { SchemeUptakeChart } from '../components/charts/SchemeUptakeChart';
import { GapChart } from '../components/charts/GapChart';
import { SCHEMES } from '../lib/constants';
import type { AnalyticsSummary, GapResult, Study } from '../lib/types';
import { Spinner } from '../components/Spinner';

export function Analytics() {
  const { user } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [studyId, setStudyId] = useState<string>('');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [scheme, setScheme] = useState(SCHEMES[0]);
  const [gap, setGap] = useState<GapResult | null>(null);
  const [sampleSize, setSampleSize] = useState(600);
  const [exporting, setExporting] = useState(false);

  const districtChartRef = useRef(null);
  const schemeChartRef = useRef(null);
  const gapChartRef = useRef(null);

  useEffect(() => {
    api.get<{ studies: Study[] }>('/studies').then((r) => setStudies(r.studies));
  }, []);

  usePolling(() => {
    const query = studyId ? `?studyId=${studyId}` : '';
    api.get<AnalyticsSummary>(`/analytics/summary${query}`).then(setSummary).catch(() => {});
  }, 15_000, [studyId]);

  useEffect(() => {
    const query = new URLSearchParams({ scheme, ...(studyId ? { studyId } : {}) });
    api.get<GapResult>(`/analytics/gap?${query.toString()}`).then(setGap).catch(() => setGap(null));
  }, [scheme, studyId]);

  const marginOfError = useMemo(() => {
    return (1.96 * Math.sqrt(0.25 / sampleSize) * 100).toFixed(1);
  }, [sampleSize]);

  async function handleExportPdf() {
    if (!summary) return;
    setExporting(true);
    try {
      const chartImages = [
        { title: 'Sample distribution by district', ref: districtChartRef },
        { title: 'Welfare scheme uptake by community', ref: schemeChartRef },
        { title: `PMAY-G-style uptake gap — ${scheme}`, ref: gapChartRef },
      ]
        .filter((c) => c.ref.current)
        .map((c) => ({ title: c.title, dataUrl: (c.ref.current as any).toBase64Image() }));

      // Loaded on demand: jsPDF (and its html2canvas dependency chain) is only
      // needed when someone actually exports a report, so keeping it out of
      // the main bundle keeps the app's initial load fast.
      const { buildAnalyticsPdf } = await import('../lib/pdfReport');
      const study = studies.find((s) => s.id === studyId) ?? null;
      const doc = buildAnalyticsPdf({ study, summary, gap, chartImages, generatedBy: user?.name ?? 'Unknown' });
      doc.save(`survey-analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">Analytics</h1>
          <p className="mt-1 text-sm text-ink-secondary">Live cross-tabulated survey data. Updates automatically.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input w-auto" value={studyId} onChange={(e) => setStudyId(e.target.value)}>
            <option value="">All studies</option>
            {studies.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <button className="btn-primary" onClick={handleExportPdf} disabled={exporting || !summary}>
            {exporting ? <Spinner className="h-4 w-4 text-white" /> : 'Export PDF report'}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-primary">Sample size &amp; margin of error</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm text-ink-secondary" htmlFor="sample-size">Sample size</label>
          <input
            id="sample-size"
            type="range"
            min={200}
            max={2000}
            step={100}
            value={sampleSize}
            onChange={(e) => setSampleSize(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-14 text-right text-sm font-medium text-ink-primary tabular-nums">{sampleSize}</span>
          <span className="text-sm text-ink-secondary">±{marginOfError}%</span>
          <span className="text-xs text-ink-muted">95% confidence</span>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-primary">Sample distribution by district</h2>
        {summary ? <DistrictBarChart data={summary.districtDistribution} chartRef={districtChartRef} /> : <ChartSkeleton />}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-primary">Welfare scheme uptake by community</h2>
        {summary ? <SchemeUptakeChart data={summary.schemeUptake} chartRef={schemeChartRef} /> : <ChartSkeleton />}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-primary">Uptake gap by sub-community</h2>
          <select className="input w-auto" value={scheme} onChange={(e) => setScheme(e.target.value)}>
            {SCHEMES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {gap ? (
          gap.gap.length ? (
            <GapChart data={gap.gap} chartRef={gapChartRef} />
          ) : (
            <p className="py-8 text-center text-sm text-ink-muted">Not enough sub-community data yet for this scheme.</p>
          )
        ) : (
          <ChartSkeleton />
        )}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-40 items-center justify-center text-ink-muted">
      <Spinner />
    </div>
  );
}
