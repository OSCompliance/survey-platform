export interface Study {
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
  owner_name: string;
  response_count?: number;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  study_id: string;
  source: 'staff' | 'public';
  district: string;
  religion: string;
  sub_community: string | null;
  reservation_category: string | null;
  schemes_applied: string;
  women_working_count: string | null;
  women_work_types: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totals: { households: number; districts: number };
  districtDistribution: { district: string; count: number }[];
  schemeUptake: { religion: string; scheme: string; count: number; percentage: number }[];
  generatedAt: string;
}

export interface GapResult {
  scheme: string;
  overallUptakePct: number;
  gap: { subCommunity: string; uptakePct: number; gapPp: number; sampleSize: number }[];
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'researcher' | 'analyst';
  is_active: number;
  created_at: string;
  last_login_at: string | null;
}

export interface AuditEntry {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: string | null;
  created_at: string;
}
