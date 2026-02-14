import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const TOP_N = 20;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('stories')
      .select('id, text, story_name, sucks_count')
      .order('sucks_count', { ascending: false })
      .limit(TOP_N);

    if (error) throw error;

    const storyIds = (data ?? []).map((row) => row.id);

    // If userId provided, fetch which of these stories the user already voted on
    let votedStoryIds: string[] = [];
    if (userId && storyIds.length > 0) {
      const { data: votes } = await supabase
        .from('votes')
        .select('story_id')
        .eq('user_id', userId)
        .in('story_id', storyIds);

      votedStoryIds = (votes ?? []).map((v) => v.story_id);
    }

    return NextResponse.json({
      success: true,
      entries: (data ?? []).map((row, index) => ({
        rank: index + 1,
        storyId: row.id,
        text: row.text,
        storyName: row.story_name ?? null,
        thatsBadCount: row.sucks_count,
        hasVoted: votedStoryIds.includes(row.id),
      })),
    });
  } catch (e) {
    console.error('Leaderboard error:', e);
    return NextResponse.json(
      { success: false, error: 'failed_to_load' },
      { status: 500 }
    );
  }
}
