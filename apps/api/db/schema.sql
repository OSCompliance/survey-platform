-- Survey platform schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('admin','researcher','analyst')),
  password_hash  TEXT NOT NULL,
  password_salt  TEXT NOT NULL,
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at  TEXT
);

CREATE TABLE IF NOT EXISTS studies (
  id                          TEXT PRIMARY KEY,
  title                       TEXT NOT NULL,
  study_type                  TEXT NOT NULL CHECK (study_type IN ('secondary','primary_survey','qualitative','rti_based')),
  status                      TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','field_active','in_progress','year_2','completed')),
  description                 TEXT,
  lead_name                   TEXT,
  output                      TEXT,
  budget_inr                  REAL,
  is_public_collection_enabled INTEGER NOT NULL DEFAULT 0,
  owner_user_id               TEXT NOT NULL REFERENCES users(id),
  created_at                  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at                  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Analytical / non-identifying survey data. Kept separate from response_pii
-- so a future field-level RBAC pass can restrict the PII table independently
-- of who can query aggregate analytics.
CREATE TABLE IF NOT EXISTS responses (
  id                    TEXT PRIMARY KEY,
  study_id              TEXT NOT NULL REFERENCES studies(id),
  client_uuid           TEXT NOT NULL UNIQUE,
  source                TEXT NOT NULL CHECK (source IN ('staff','public')),
  submitted_by_user_id  TEXT REFERENCES users(id),
  district              TEXT NOT NULL,
  religion              TEXT NOT NULL,
  sub_community         TEXT,
  reservation_category  TEXT,
  schemes_applied       TEXT NOT NULL DEFAULT '[]',
  women_working_count   TEXT,
  women_work_types      TEXT NOT NULL DEFAULT '[]',
  notes                 TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Identity-linked fields, deliberately isolated from the analytical table.
CREATE TABLE IF NOT EXISTS response_pii (
  response_id      TEXT PRIMARY KEY REFERENCES responses(id),
  respondent_name  TEXT,
  phone            TEXT,
  gps_lat          REAL,
  gps_lng          REAL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  metadata    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_responses_study      ON responses(study_id);
CREATE INDEX IF NOT EXISTS idx_responses_district    ON responses(district);
CREATE INDEX IF NOT EXISTS idx_responses_religion    ON responses(religion);
CREATE INDEX IF NOT EXISTS idx_responses_created_at  ON responses(created_at);
CREATE INDEX IF NOT EXISTS idx_studies_owner         ON studies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at      ON audit_log(created_at);
