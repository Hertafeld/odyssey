-- Run this in Supabase SQL Editor if you already applied schema.sql and only need the function.
-- p_exclude_ids: optional array of story IDs to exclude (e.g. current story when pre-fetching next).
CREATE OR REPLACE FUNCTION get_random_unseen_story(p_user_id UUID, p_exclude_ids UUID[] DEFAULT '{}')
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
  AND NOT (s.id = ANY(COALESCE(p_exclude_ids, ARRAY[]::UUID[])))
  ORDER BY RANDOM()
  LIMIT 1;
$$;
