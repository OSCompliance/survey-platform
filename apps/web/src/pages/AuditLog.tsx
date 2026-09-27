import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { AuditEntry } from '../lib/types';
import { Spinner } from '../components/Spinner';

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);

  useEffect(() => {
    api.get<{ entries: AuditEntry[] }>('/audit').then((r) => setEntries(r.entries));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Audit log</h1>
        <p className="mt-1 text-sm text-ink-secondary">Recent account and data actions across the platform.</p>
      </div>

      <div className="card divide-y divide-border">
        {!entries ? (
          <div className="flex h-32 items-center justify-center"><Spinner /></div>
        ) : entries.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-muted">No activity recorded yet.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div>
                <p className="text-ink-primary">
                  <span className="font-medium">{e.user_name ?? 'Public respondent'}</span>{' '}
                  <span className="text-ink-secondary">{e.action.replace(/_/g, ' ')}</span>{' '}
                  <span className="text-ink-muted">{e.entity}</span>
                </p>
                {e.user_email && <p className="text-xs text-ink-muted">{e.user_email}</p>}
              </div>
              <span className="shrink-0 text-xs text-ink-muted">{new Date(e.created_at).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
