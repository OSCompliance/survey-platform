import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { RoleBadge } from './Badge';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/studies', label: 'Studies' },
  { to: '/collect', label: 'Data collection' },
  { to: '/analytics', label: 'Analytics' },
];

const ADMIN_NAV_ITEMS = [
  { to: '/users', label: 'Users' },
  { to: '/audit', label: 'Audit log' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-surface-page">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-sm font-semibold text-white">
            S
          </div>
          <span className="text-sm font-semibold text-ink-primary">Survey Platform</span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-secondary hover:bg-surface-page hover:text-ink-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Admin</div>
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-secondary hover:bg-surface-page hover:text-ink-primary'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between rounded-md px-2 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-primary">{user?.name}</p>
              <p className="truncate text-xs text-ink-muted">{user?.email}</p>
            </div>
            {user && <RoleBadge role={user.role} />}
          </div>
          <button onClick={handleLogout} className="btn-ghost mt-1 w-full justify-start px-2">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
