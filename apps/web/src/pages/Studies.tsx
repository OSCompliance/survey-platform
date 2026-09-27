import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Study } from '../lib/types';
import { STUDY_STATUSES, STUDY_TYPES } from '../lib/constants';
import { StatusBadge } from '../components/Badge';
import { Spinner } from '../components/Spinner';

export function Studies() {
  const { user } = useAuth();
  const [studies, setStudies] = useState<Study[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<{ studies: Study[] }>('/studies').then((r) => setStudies(r.studies)).catch(() => {});
  }

  useEffect(load, []);

  const canCreate = user?.role === 'admin' || user?.role === 'researcher';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">Studies</h1>
          <p className="mt-1 text-sm text-ink-secondary">All research studies on the platform.</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'New study'}
          </button>
        )}
      </div>

      {error && <div className="rounded-md bg-status-critical/10 px-3 py-2 text-sm text-red-700">{error}</div>}

      {showForm && (
        <NewStudyForm
          onCreated={() => {
            setShowForm(false);
            load();
          }}
          onError={setError}
        />
      )}

      <div className="card divide-y divide-border">
        {!studies ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner />
          </div>
        ) : studies.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-muted">No studies yet.</p>
        ) : (
          studies.map((s) => (
            <Link key={s.id} to={`/studies/${s.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-surface-page">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  {STUDY_TYPES.find((t) => t.value === s.study_type)?.label ?? s.study_type}
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-ink-primary">{s.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {s.response_count ?? 0} responses · led by {s.owner_name}
                  {s.budget_inr ? ` · ₹${(s.budget_inr / 100000).toFixed(1)}L` : ''}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function NewStudyForm({ onCreated, onError }: { onCreated: () => void; onError: (e: string | null) => void }) {
  const [title, setTitle] = useState('');
  const [studyType, setStudyType] = useState(STUDY_TYPES[0].value);
  const [leadName, setLeadName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetInr, setBudgetInr] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    try {
      await api.post('/studies', {
        title,
        studyType,
        leadName: leadName || undefined,
        description: description || undefined,
        budgetInr: budgetInr ? Number(budgetInr) : undefined,
        isPublicCollectionEnabled: isPublic,
      });
      onCreated();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to create study');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Title</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Study type</label>
          <select className="input" value={studyType} onChange={(e) => setStudyType(e.target.value)}>
            {STUDY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Lead researcher</label>
          <input className="input" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
        </div>
        <div>
          <label className="label">Budget (INR)</label>
          <input className="input" type="number" min="0" value={budgetInr} onChange={(e) => setBudgetInr(e.target.value)} />
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input id="isPublic" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <label htmlFor="isPublic" className="text-sm text-ink-secondary">Enable public self-service link</label>
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? <Spinner className="h-4 w-4 text-white" /> : 'Create study'}
      </button>
    </form>
  );
}

// Re-exported for StudyDetail's status editor.
export { STUDY_STATUSES };
