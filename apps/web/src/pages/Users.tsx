import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { PlatformUser } from '../lib/types';
import { RoleBadge } from '../components/Badge';
import { Spinner } from '../components/Spinner';

const ROLES: PlatformUser['role'][] = ['admin', 'researcher', 'analyst'];

export function Users() {
  const [users, setUsers] = useState<PlatformUser[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<{ users: PlatformUser[] }>('/users').then((r) => setUsers(r.users));
  }

  useEffect(load, []);

  async function toggleActive(u: PlatformUser) {
    try {
      await api.patch(`/users/${u.id}`, { isActive: !u.is_active });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update user');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">Users</h1>
          <p className="mt-1 text-sm text-ink-secondary">Staff accounts and roles.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Invite user'}
        </button>
      </div>

      {error && <div className="rounded-md bg-status-critical/10 px-3 py-2 text-sm text-red-700">{error}</div>}

      {showForm && (
        <NewUserForm
          onCreated={() => {
            setShowForm(false);
            load();
          }}
          onError={setError}
        />
      )}

      <div className="card divide-y divide-border">
        {!users ? (
          <div className="flex h-32 items-center justify-center"><Spinner /></div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-primary">{u.name}</p>
                <p className="text-xs text-ink-muted">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <RoleBadge role={u.role} />
                <span className={`badge ${u.is_active ? 'bg-status-good/10 text-green-700' : 'bg-surface-page text-ink-muted'}`}>
                  {u.is_active ? 'Active' : 'Disabled'}
                </span>
                <button className="btn-ghost" onClick={() => toggleActive(u)}>
                  {u.is_active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function NewUserForm({ onCreated, onError }: { onCreated: () => void; onError: (e: string | null) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PlatformUser['role']>('researcher');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    try {
      await api.post('/users', { name, email, role, password });
      onCreated();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card grid grid-cols-2 gap-4 p-5">
      <div>
        <label className="label">Name</label>
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label">Role</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as PlatformUser['role'])}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Temporary password</label>
        <input className="input" type="text" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="col-span-2">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? <Spinner className="h-4 w-4 text-white" /> : 'Create user'}
        </button>
      </div>
    </form>
  );
}
