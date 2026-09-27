export type Role = 'admin' | 'researcher' | 'analyst';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_ENFORCED: string;
  CORS_ALLOWED_ORIGINS: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface StudyRow {
  id: string;
  title: string;
  study_type: 'secondary' | 'primary_survey' | 'qualitative' | 'rti_based';
  status: 'planning' | 'field_active' | 'in_progress' | 'year_2' | 'completed';
  description: string | null;
  lead_name: string | null;
  output: string | null;
  budget_inr: number | null;
  is_public_collection_enabled: number;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ResponseRow {
  id: string;
  study_id: string;
  client_uuid: string;
  source: 'staff' | 'public';
  submitted_by_user_id: string | null;
  district: string;
  religion: string;
  sub_community: string | null;
  reservation_category: string | null;
  schemes_applied: string;
  women_working_count: string | null;
  women_work_types: string;
  notes: string | null;
  created_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  password_hash: string;
  password_salt: string;
  is_active: number;
  created_at: string;
  last_login_at: string | null;
}
