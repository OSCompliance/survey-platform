import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Study } from '../lib/types';
import {
  DISTRICTS,
  RELIGIONS,
  RESERVATION_CATEGORIES,
  SCHEMES,
  SUB_COMMUNITIES,
  WOMEN_WORKING_OPTIONS,
  WOMEN_WORK_TYPES,
} from '../lib/constants';
import { Spinner } from '../components/Spinner';

export function Collect() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [studyId, setStudyId] = useState('');

  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [religion, setReligion] = useState(RELIGIONS[0]);
  const [subCommunity, setSubCommunity] = useState('');
  const [reservationCategory, setReservationCategory] = useState(RESERVATION_CATEGORIES[0]);
  const [schemesApplied, setSchemesApplied] = useState<string[]>([]);
  const [womenWorkingCount, setWomenWorkingCount] = useState(WOMEN_WORKING_OPTIONS[0]);
  const [womenWorkTypes, setWomenWorkTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get<{ studies: Study[] }>('/studies').then((r) => {
      setStudies(r.studies);
      if (r.studies.length) setStudyId(r.studies[0].id);
    });
  }, []);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function resetForm() {
    setSubCommunity('');
    setSchemesApplied([]);
    setWomenWorkingCount(WOMEN_WORKING_OPTIONS[0]);
    setWomenWorkTypes([]);
    setNotes('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    setSubmitting(true);
    try {
      await api.post('/responses', {
        studyId,
        district,
        religion,
        subCommunity: subCommunity || undefined,
        reservationCategory,
        schemesApplied,
        womenWorkingCount,
        womenWorkTypes,
        notes: notes || undefined,
      });
      setResult('success');
      resetForm();
    } catch (err) {
      setResult('error');
      setErrorMessage(err instanceof ApiError ? err.message : 'Failed to submit response');
    } finally {
      setSubmitting(false);
      setTimeout(() => setResult(null), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Data collection</h1>
        <p className="mt-1 text-sm text-ink-secondary">Household survey — staff entry.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div>
          <label className="label">Study</label>
          <select className="input" value={studyId} onChange={(e) => setStudyId(e.target.value)} required>
            {studies.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-4">
          <legend className="mb-1 text-sm font-semibold text-ink-primary">Section A — household identification</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">District</label>
              <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Religion</label>
              <select className="input" value={religion} onChange={(e) => setReligion(e.target.value)}>
                {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {religion === 'Muslim' && (
              <div>
                <label className="label">Sub-community</label>
                <select className="input" value={subCommunity} onChange={(e) => setSubCommunity(e.target.value)}>
                  <option value="">Select…</option>
                  {SUB_COMMUNITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label">Reservation category</label>
              <select className="input" value={reservationCategory} onChange={(e) => setReservationCategory(e.target.value)}>
                {RESERVATION_CATEGORIES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-semibold text-ink-primary">Section B — welfare scheme access</legend>
          <p className="text-xs text-ink-muted">Schemes applied for in the last 12 months</p>
          <div className="space-y-2">
            {SCHEMES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-ink-secondary">
                <input type="checkbox" checked={schemesApplied.includes(s)} onChange={() => toggle(schemesApplied, setSchemesApplied, s)} />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-1 text-sm font-semibold text-ink-primary">Section C — women in household</legend>
          <div>
            <label className="label">Adult women (18+) currently doing paid work?</label>
            <select className="input" value={womenWorkingCount} onChange={(e) => setWomenWorkingCount(e.target.value)}>
              {WOMEN_WORKING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {womenWorkingCount !== 'None' && (
            <div className="space-y-2">
              <p className="text-xs text-ink-muted">Type of work (select all)</p>
              {WOMEN_WORK_TYPES.map((w) => (
                <label key={w} className="flex items-center gap-2 text-sm text-ink-secondary">
                  <input type="checkbox" checked={womenWorkTypes.includes(w)} onChange={() => toggle(womenWorkTypes, setWomenWorkTypes, w)} />
                  {w}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {result === 'error' && <div className="rounded-md bg-status-critical/10 px-3 py-2 text-sm text-red-700">{errorMessage}</div>}
        {result === 'success' && <div className="rounded-md bg-status-good/10 px-3 py-2 text-sm text-green-700">Response saved.</div>}

        <button type="submit" className="btn-primary w-full" disabled={submitting || !studyId}>
          {submitting ? <Spinner className="h-4 w-4 text-white" /> : 'Submit response'}
        </button>
      </form>
    </div>
  );
}
