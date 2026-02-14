import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, excludeStoryIds } = body as { userId?: string; excludeStoryIds?: string[] };

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'user_id_required' },
        { status: 400 }
      );
    }

    const excludeIds = Array.isArray(excludeStoryIds)
      ? excludeStoryIds.filter((id): id is string => typeof id === 'string')
      : [];

    const supabase = getSupabaseServer();
    const { data, error } = await supabase.rpc('get_random_unseen_story', {
      p_user_id: userId,
      p_exclude_ids: excludeIds.length > 0 ? excludeIds : null,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : null;
    if (!row) {
      return NextResponse.json({
        success: true,
        hasStory: false,
      });
    }

    return NextResponse.json({
      success: true,
      hasStory: true,
      story: {
        storyId: row.id,
        text: row.text,
        storyName: row.story_name ?? undefined,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
