-- Manually add a few users if they don't already exist.
-- Run in Supabase SQL Editor.

-- Temp users (cookie_id only; no email/password)
INSERT INTO users (cookie_id, is_temp)
VALUES
  ('temp-dev-001', true),
  ('temp-dev-002', true),
  ('temp-dev-003', true)
ON CONFLICT (cookie_id) DO NOTHING;

-- Real user: test@example.com / password "password"
-- (bcrypt hash for "password", 10 rounds)
INSERT INTO users (email, password_hash, is_temp)
VALUES (
  'test@example.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  false
)
ON CONFLICT (email) DO NOTHING;
