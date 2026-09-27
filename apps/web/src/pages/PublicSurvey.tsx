import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { DISTRICTS, RELIGIONS, RESERVATION_CATEGORIES, SCHEMES, SUB_COMMUNITIES } from '../lib/constants';
import { Turnstile } from '../components/Turnstile';
import { Spinner } from '../components/Spinner';

interface PublicStudy {
  id: string;
  title: string;
  description: string | null;
}

export function PublicSurvey() {
  const { studyId } = useParams<{ studyId: string }>();
  const [study, setStudy] = useState<PublicStudy | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [religion, setReligion] = useState(RELIGIONS[0]);
  const [subCommunity, setSubCommunity] = useState('');
  const [reservationCategory, setReservationCategory] = useState('');
  const [schemesApplied, setSchemesApplied] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studyId) return;
    api
      .get<{ study: PublicStudy }>(`/public/studies/${studyId}`)
      .then((r) => setStudy(r.study))
      .catch(() => setNotFound(true));
  }, [studyId]);

  function toggleScheme(value: string) {
    setSchemesApplied((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!studyId) return;
    setError(null);
    setSubmitting(true);
    try {
      await api.post(`/public/responses/${studyId}`, {
        district,
        religion,
        subCommunity: subCommunity || undefined,
        reservationCategory: reservationCategory || undefined,
        schemesApplied,
        turnstileToken: turnstileToken || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <CenteredCard>
        <p className="text-sm text-ink-secondary">This survey link is not currently accepting responses.</p>
      </CenteredCard>
    );
  }

  if (!study) {
    return (
      <CenteredCard>
        <Spinner />
      </CenteredCard>
    );
  }

  if (submitted) {
    return (
      <CenteredCard>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-status-good/10 text-status-good">✓</div>
        <h1 className="text-lg font-semibold text-ink-primary">Thank you</h1>
        <p className="mt-1 text-sm text-ink-secondary">Your response has been recorded.</p>
      </CenteredCard>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-surface-page px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-ink-primary">{study.title}</h1>
          {study.description && <p className="mt-1 text-sm text-ink-secondary">{study.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5 p-6">
          {error && <div className="rounded-md bg-status-critical/10 px-3 py-2 text-sm text-red-700">{error}</div>}

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
              <label className="label">Sub-community (optional)</label>
              <select className="input" value={subCommunity} onChange={(e) => setSubCommunity(e.target.value)}>
                <option value="">Prefer not to say</option>
                {SUB_COMMUNITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="label">Reservation category (optional)</label>
            <select className="input" value={reservationCategory} onChange={(e) => setReservationCategory(e.target.value)}>
              <option value="">Prefer not to say</option>
              {RESERVATION_CATEGORIES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Welfare schemes your household has applied for in the last 12 months</label>
            <div className="space-y-2">
              {SCHEMES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-ink-secondary">
                  <input type="checkbox" checked={schemesApplied.includes(s)} onChange={() => toggleScheme(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <Turnstile onVerify={setTurnstileToken} />

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <Spinner className="h-4 w-4 text-white" /> : 'Submit'}
          </button>

          <p className="text-center text-xs text-ink-muted">
            Your responses are used for research purposes only and handled per the study's consent terms.
          </p>
        </form>
      </div>
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4">
      <div className="card flex max-w-sm flex-col items-center p-8 text-center">{children}</div>
    </div>
  );
}
