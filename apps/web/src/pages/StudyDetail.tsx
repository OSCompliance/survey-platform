import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError, downloadFile } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Study, SurveyResponse } from '../lib/types';
import { STUDY_STATUSES, STUDY_TYPES } from '../lib/constants';
import { SourceBadge, StatusBadge } from '../components/Badge';
import { Spinner } from '../components/Spinner';

export function StudyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [study, setStudy] = useState<(Study & { owner_name: string }) | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    if (!id) return;
    api.get<{ study: Study & { owner_name: string } }>(`/studies/${id}`).then((r) => setStudy(r.study));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api
      .get<{ responses: SurveyResponse[]; pagination: { total: number } }>(
        `/responses?studyId=${id}&page=${page}&pageSize=${pageSize}`,
      )
      .then((r) => {
        setResponses(r.responses);
        setTotal(r.pagination.total);
      });
  }, [id, page]);

  const canManage = study && user && (user.role === 'admin' || user.id === study.owner_user_id);
  const publicUrl = study?.is_public_collection_enabled ? `${window.location.origin}/survey/${study.id}` : null;

  async function handleStatusChange(status: string) {
    if (!id) return;
    try {
      await api.patch(`/studies/${id}`, { status });
      setStudy((s) => (s ? { ...s, status: status as Study['status'] } : s));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update status');
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Delete this study and all of its responses? This cannot be undone.')) return;
    try {
      await api.del(`/studies/${id}`);
      navigate('/studies');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete study');
    }
  }

  if (!study) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/studies" className="text-sm text-ink-muted hover:text-ink-primary">← Studies</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {STUDY_TYPES.find((t) => t.value === study.study_type)?.label}
            </p>
            <h1 className="mt-0.5 text-xl font-semibold text-ink-primary">{study.title}</h1>
            {study.description && <p className="mt-1 max-w-2xl text-sm text-ink-secondary">{study.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {canManage ? (
              <select
                className="input w-auto"
                value={study.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STUDY_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            ) : (
              <StatusBadge status={study.status} />
            )}
          </div>
        </div>
      </div>

      {error && <div className="rounded-md bg-status-critical/10 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-ink-secondary">Lead</p>
          <p className="mt-1 text-sm font-medium text-ink-primary">{study.lead_name ?? '—'}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-secondary">Output</p>
          <p className="mt-1 text-sm font-medium text-ink-primary">{study.output ?? '—'}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-secondary">Budget</p>
          <p className="mt-1 text-sm font-medium text-ink-primary">{study.budget_inr ? `₹${(study.budget_inr / 100000).toFixed(1)}L` : '—'}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-secondary">Responses</p>
          <p className="mt-1 text-sm font-medium text-ink-primary">{total}</p>
        </div>
      </div>

      {publicUrl && (
        <div className="card flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-primary">Public respondent link</p>
            <p className="truncate text-xs text-ink-muted">{publicUrl}</p>
          </div>
          <button className="btn-secondary shrink-0" onClick={() => navigator.clipboard.writeText(publicUrl)}>
            Copy link
          </button>
        </div>
      )}

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-primary">Responses</h2>
          <button className="btn-secondary" onClick={() => downloadFile(`/responses/export.csv?studyId=${study.id}`, `${study.title}-responses.csv`)}>
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th className="pb-2 pr-4 font-medium">District</th>
                <th className="pb-2 pr-4 font-medium">Religion</th>
                <th className="pb-2 pr-4 font-medium">Sub-community</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Schemes applied</th>
                <th className="pb-2 pr-4 font-medium">Source</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {responses.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 pr-4 text-ink-primary">{r.district}</td>
                  <td className="py-2 pr-4 text-ink-secondary">{r.religion}</td>
                  <td className="py-2 pr-4 text-ink-secondary">{r.sub_community ?? '—'}</td>
                  <td className="py-2 pr-4 text-ink-secondary">{r.reservation_category ?? '—'}</td>
                  <td className="py-2 pr-4 text-ink-secondary">{JSON.parse(r.schemes_applied || '[]').join(', ') || '—'}</td>
                  <td className="py-2 pr-4"><SourceBadge source={r.source} /></td>
                  <td className="py-2 text-ink-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {responses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-ink-muted">No responses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > pageSize && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <button className="btn-ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span className="text-ink-muted">Page {page} of {Math.ceil(total / pageSize)}</span>
            <button className="btn-ghost" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {canManage && (
        <div className="card flex items-center justify-between p-4">
          <p className="text-sm text-ink-secondary">Danger zone</p>
          <button className="btn-secondary text-red-700 hover:bg-red-50" onClick={handleDelete}>Delete study</button>
        </div>
      )}
    </div>
  );
}
