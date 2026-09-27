-- Local/dev seed data. Passwords are for local development only:
--   admin@example.org      / ChangeMe123!
--   researcher@example.org / Research123!
--   analyst@example.org    / Analyst123!
-- This file is generated, not hand-written: run `node scripts/build-seed.mjs`
-- to regenerate it (e.g. after changing these passwords), never edit the
-- password_hash / password_salt values by hand.

INSERT INTO users (id, email, name, role, password_hash, password_salt) VALUES
  ('usr-admin-0001', 'admin@example.org', 'Admin User', 'admin',
   '9d1de78f6b818eb34fe70b5d2cf4744c2f10ddcc51bd02136471d40be2d19d25', '4c46a0ff9859962cf1ddf2d56492d77c'),
  ('usr-research-0001', 'researcher@example.org', 'Dr. Fathima R.', 'researcher',
   '46b199d9566c100cc0e1938eaf39dc4ebfac5dd49e813f1c1d5c018e2a81c918', '2be2d2d68f54c6668d4db97fd21532f8'),
  ('usr-analyst-0001', 'analyst@example.org', 'Iqbal S.', 'analyst',
   '21ceeacfd8249eb7731ed0c6e1bdb09e9cbf888f7ed0899d844bd4dd13209aba', '64d0bdd75752ad6f3dab617a6eccf688');

INSERT INTO studies (id, title, study_type, status, description, lead_name, output, budget_inr, is_public_collection_enabled, owner_user_id) VALUES
  ('std-0001', 'TN Muslims after Sachar: status report 2026', 'secondary', 'in_progress',
   'Synthesis of NFHS, PLFS, AISHE, and UDISE+ data.', 'Dr. Fathima R.', 'Working paper', 250000, 0, 'usr-research-0001'),
  ('std-0002', 'Welfare scheme uptake: Chennai & Ramanathapuram', 'primary_survey', 'field_active',
   '600 households, matched-comparison design.', 'Mr. Iqbal S.', 'Policy brief + dataset', 650000, 1, 'usr-research-0001'),
  ('std-0003', 'Muslim women''s labour: Vaniyambadi & Ambur', 'qualitative', 'planning',
   '40 life histories, time-use diaries.', 'Ms. Sharifa M.', 'Ethnographic report', 320000, 0, 'usr-research-0001'),
  ('std-0004', '3.5% BC-M sub-quota: who benefits?', 'rti_based', 'year_2',
   'TNPSC data, sub-community disaggregation.', 'TBA', 'Research paper', 400000, 0, 'usr-research-0001');

-- Sample responses for std-0002, mirroring the demo's district and scheme mix.
INSERT INTO responses (id, study_id, client_uuid, source, submitted_by_user_id, district, religion, sub_community, reservation_category, schemes_applied, women_working_count, women_work_types) VALUES
  ('resp-0001', 'std-0002', 'seed-uuid-0001', 'staff', 'usr-research-0001', 'Ramanathapuram', 'Muslim', 'Marakkayar', 'BC-M (3.5%)', '["MGNREGA","Maternity benefit"]', '1', '["Home-based piece work (tailoring, beedi, agarbatti)"]'),
  ('resp-0002', 'std-0002', 'seed-uuid-0002', 'staff', 'usr-research-0001', 'Ramanathapuram', 'Muslim', 'Rowther', 'BC-M (3.5%)', '["Ujjwala (LPG)"]', 'None', '[]'),
  ('resp-0003', 'std-0002', 'seed-uuid-0003', 'staff', 'usr-research-0001', 'Chennai', 'Muslim', 'Labbai', 'BC-M (3.5%)', '["PMAY-G (housing)","Post-matric scholarship"]', '2', '["Salaried (govt / private)","Domestic work"]'),
  ('resp-0004', 'std-0002', 'seed-uuid-0004', 'staff', 'usr-research-0001', 'Chennai', 'Hindu', NULL, 'BC', '["PMAY-G (housing)","MGNREGA","Maternity benefit"]', '1', '["Agricultural labour"]'),
  ('resp-0005', 'std-0002', 'seed-uuid-0005', 'staff', 'usr-research-0001', 'Vellore', 'Muslim', 'Dakhni', 'BC-M (3.5%)', '[]', 'None', '[]'),
  ('resp-0006', 'std-0002', 'seed-uuid-0006', 'staff', 'usr-research-0001', 'Vellore', 'Hindu', NULL, 'MBC', '["Ujjwala (LPG)","Post-matric scholarship"]', '2', '["Self-employed / shop"]'),
  ('resp-0007', 'std-0002', 'seed-uuid-0007', 'public', NULL, 'Tirunelveli', 'Muslim', 'Sheik / Sayyid', 'BC-M (3.5%)', '["MGNREGA"]', '1', '["Domestic work"]'),
  ('resp-0008', 'std-0002', 'seed-uuid-0008', 'staff', 'usr-research-0001', 'Madurai', 'Muslim', 'Kayalar', 'BC-M (3.5%)', '[]', 'None', '[]'),
  ('resp-0009', 'std-0002', 'seed-uuid-0009', 'staff', 'usr-research-0001', 'Madurai', 'Hindu', NULL, 'OC', '["PMAY-G (housing)","Post-matric scholarship","Maternity benefit"]', '1', '["Salaried (govt / private)"]'),
  ('resp-0010', 'std-0002', 'seed-uuid-0010', 'staff', 'usr-research-0001', 'Tiruchirappalli', 'Muslim', 'Marakkayar', 'BC-M (3.5%)', '["Post-matric scholarship"]', '1', '["Home-based piece work (tailoring, beedi, agarbatti)"]');
