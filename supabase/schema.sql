-- I've Had Worse – initial schema
-- Run this in Supabase Dashboard → SQL Editor

-- Users (temp = cookie only; real = email + password or OAuth later)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_temp BOOLEAN NOT NULL DEFAULT true,
  email TEXT UNIQUE,
  password_hash TEXT,
  cookie_id TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  story_name TEXT,
  sucks_count INT NOT NULL DEFAULT 0,
  ive_had_worse_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Votes (one per user per story; upsert on re-vote)
CREATE TABLE IF NOT EXISTS votes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('sucks', 'ive_had_worse')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_story_id ON votes(story_id);

-- Optional: RLS (Row Level Security) – enable if you want Supabase client to respect policies
-- For API routes using the service role key, RLS is bypassed. You can add policies later.
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Random unseen story for a user (used by Fetch endpoint)
CREATE OR REPLACE FUNCTION get_random_unseen_story(p_user_id UUID)
RETURNS TABLE (id UUID, text TEXT, story_name TEXT)
LANGUAGE sql
STABLE
AS $$
  SELECT s.id, s.text, s.story_name
  FROM stories s
  WHERE NOT EXISTS (
    SELECT 1 FROM votes v
    WHERE v.story_id = s.id AND v.user_id = p_user_id
  )
  ORDER BY RANDOM()
  LIMIT 1;
$$;
