-- Example stories from seeded users. Run seed-users.sql first, then this.
-- Run in Supabase SQL Editor.

INSERT INTO stories (user_id, text, story_name)
SELECT id, 'He brought his mom to our first date. She ordered for him.', 'MommasBoy_Run'
FROM users WHERE cookie_id = 'temp-dev-001' LIMIT 1;

INSERT INTO stories (user_id, text, story_name)
SELECT id, 'She spent 20 minutes explaining why the earth is flat. We were at a planetarium.', 'ScienceGuy'
FROM users WHERE cookie_id = 'temp-dev-001' LIMIT 1;

INSERT INTO stories (user_id, text, story_name)
SELECT id, 'He forgot his wallet, so I paid. Then he asked for the receipt to expense it.', 'CorporateGreed'
FROM users WHERE cookie_id = 'temp-dev-002' LIMIT 1;

INSERT INTO stories (user_id, text, story_name)
SELECT id, 'She Googled my name during dinner and read my LinkedIn out loud to the table.', 'RecruiterVibes'
FROM users WHERE cookie_id = 'temp-dev-002' LIMIT 1;

INSERT INTO stories (user_id, text, story_name)
SELECT id, 'He said his ex was "crazy." Then his ex showed up at the restaurant. She was not crazy.', 'RedFlagCentral'
FROM users WHERE cookie_id = 'temp-dev-003' LIMIT 1;

INSERT INTO stories (user_id, text, story_name)
SELECT id, 'She brought a list of 50 questions. Question 12 was "How do you feel about your mother?"', 'InterviewMode'
FROM users WHERE cookie_id = 'temp-dev-003' LIMIT 1;

INSERT INTO stories (user_id, text, story_name)
SELECT id, 'We matched on an app. When we met he said "You look different in person" and showed me his type.', 'CatfishVibes'
FROM users WHERE email = 'test@example.com' LIMIT 1;

INSERT INTO stories (user_id, text, story_name)
SELECT id, 'He spent the whole dinner on the phone with his broker. I learned a lot about shorting. Nothing about him.', 'WallStreetFella'
FROM users WHERE email = 'test@example.com' LIMIT 1;
