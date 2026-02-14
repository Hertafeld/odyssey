-- Run this in Supabase SQL Editor if you already applied schema.sql and only need the function.
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
