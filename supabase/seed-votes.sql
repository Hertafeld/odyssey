-- Example votes from seeded users on seeded stories. Run seed-users.sql and seed-stories.sql first.
-- Run in Supabase SQL Editor.
-- Uses story_name to find stories; re-run is safe (ON CONFLICT DO NOTHING).

INSERT INTO votes (user_id, story_id, vote)
SELECT u.id, s.id, 'sucks'
FROM users u, stories s
WHERE u.cookie_id = 'temp-dev-002' AND s.story_name = 'MommasBoy_Run'
LIMIT 1
ON CONFLICT (user_id, story_id) DO NOTHING;

INSERT INTO votes (user_id, story_id, vote)
SELECT u.id, s.id, 'ive_had_worse'
FROM users u, stories s
WHERE u.cookie_id = 'temp-dev-002' AND s.story_name = 'ScienceGuy'
LIMIT 1
ON CONFLICT (user_id, story_id) DO NOTHING;

INSERT INTO votes (user_id, story_id, vote)
SELECT u.id, s.id, 'ive_had_worse'
FROM users u, stories s
WHERE u.cookie_id = 'temp-dev-001' AND s.story_name = 'CorporateGreed'
LIMIT 1
ON CONFLICT (user_id, story_id) DO NOTHING;

INSERT INTO votes (user_id, story_id, vote)
SELECT u.id, s.id, 'sucks'
FROM users u, stories s
WHERE u.cookie_id = 'temp-dev-001' AND s.story_name = 'RecruiterVibes'
LIMIT 1
ON CONFLICT (user_id, story_id) DO NOTHING;

INSERT INTO votes (user_id, story_id, vote)
SELECT u.id, s.id, 'sucks'
FROM users u, stories s
WHERE u.cookie_id = 'temp-dev-003' AND s.story_name = 'WallStreetFella'
LIMIT 1
ON CONFLICT (user_id, story_id) DO NOTHING;

INSERT INTO votes (user_id, story_id, vote)
SELECT u.id, s.id, 'ive_had_worse'
FROM users u, stories s
WHERE u.cookie_id = 'temp-dev-003' AND s.story_name = 'CatfishVibes'
LIMIT 1
ON CONFLICT (user_id, story_id) DO NOTHING;

INSERT INTO votes (user_id, story_id, vote)
SELECT u.id, s.id, 'ive_had_worse'
FROM users u, stories s
WHERE u.email = 'test@example.com' AND s.story_name = 'RedFlagCentral'
LIMIT 1
ON CONFLICT (user_id, story_id) DO NOTHING;

INSERT INTO votes (user_id, story_id, vote)
SELECT u.id, s.id, 'sucks'
FROM users u, stories s
WHERE u.email = 'test@example.com' AND s.story_name = 'InterviewMode'
LIMIT 1
ON CONFLICT (user_id, story_id) DO NOTHING;

-- Sync story vote counts (app normally does this when voting)
UPDATE stories st
SET
  sucks_count = (SELECT COUNT(*) FROM votes v WHERE v.story_id = st.id AND v.vote = 'sucks'),
  ive_had_worse_count = (SELECT COUNT(*) FROM votes v WHERE v.story_id = st.id AND v.vote = 'ive_had_worse');
