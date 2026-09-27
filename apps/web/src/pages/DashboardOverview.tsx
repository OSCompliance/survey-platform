import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { usePolling } from '../hooks/usePolling';
import { StatTile } from '../components/StatTile';
import { StatusBadge } from '../components/Badge';
import { DistrictBarChart } from '../components/charts/DistrictBarChart';
import { SchemeUptakeChart } from '../components/charts/SchemeUptakeChart';
import type { AnalyticsSummary, Study } from '../lib/types';
import { Spinner } from '../components/Spinner';

export function DashboardOverview() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [studies, setStudies] = useState<Study[] | null>(null);

  usePolling(() => {
    api.get<AnalyticsSummary>('/analytics/summary').then(setSummary).catch(() => {});
  }, 15_000);

  usePolling(() => {
    api.get<{ studies: Study[] }>('/studies').then((r) => setStudies(r.studies)).catch(() => {});
  }, 30_000);

  const activeStudies = studies?.filter((s) => s.status !== 'completed').length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Overview</h1>
        <p className="mt-1 text-sm text-ink-secondary">Live snapshot across all studies. Refreshes automatically.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Active studies" value={studies ? activeStudies : '—'} />
        <StatTile label="Households surveyed" value={summary ? summary.totals.households.toLocaleString() : '—'} />
        <StatTile label="Districts covered" value={summary ? summary.totals.districts : '—'} />
        <StatTile label="Total studies" value={studies ? studies.length : '—'} />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-primary">Sample distribution by district</h2>
        {summary ? <DistrictBarChart data={summary.districtDistribution} /> : <ChartSkeleton />}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-primary">Welfare scheme uptake by community</h2>
        {summary ? <SchemeUptakeChart data={summary.schemeUptake} /> : <ChartSkeleton />}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-primary">Studies</h2>
          <Link to="/studies" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        {!studies ? (
          <ChartSkeleton />
        ) : (
          <div className="divide-y divide-border">
            {studies.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                to={`/studies/${s.id}`}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-surface-page -mx-2 px-2 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-ink-primary">{s.title}</p>
                  <p className="text-xs text-ink-muted">{s.response_count ?? 0} responses · led by {s.owner_name}</p>
                </div>
                <StatusBadge status={s.status} />
              </Link>
            ))}
          </div>
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
