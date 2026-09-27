const STATUS_STYLES: Record<string, string> = {
  planning: 'bg-surface-page text-ink-secondary',
  field_active: 'bg-brand-50 text-brand-700',
  in_progress: 'bg-brand-50 text-brand-700',
  year_2: 'bg-surface-page text-ink-secondary',
  completed: 'bg-green-50 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  field_active: 'Field active',
  in_progress: 'In progress',
  year_2: 'Year 2',
  completed: 'Completed',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] ?? 'bg-surface-page text-ink-secondary'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-brand-50 text-brand-700',
  researcher: 'bg-green-50 text-green-700',
  analyst: 'bg-surface-page text-ink-secondary',
};

export function RoleBadge({ role }: { role: string }) {
  return <span className={`badge ${ROLE_STYLES[role] ?? 'bg-surface-page text-ink-secondary'} capitalize`}>{role}</span>;
}

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className={`badge ${source === 'public' ? 'bg-status-warning/10 text-amber-700' : 'bg-surface-page text-ink-secondary'}`}>
      {source === 'public' ? 'Public' : 'Staff'}
    </span>
  );
}
