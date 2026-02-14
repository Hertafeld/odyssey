import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const TOP_N = 20;

export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('stories')
      .select('id, text, story_name, sucks_count')
      .order('sucks_count', { ascending: false })
      .limit(TOP_N);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      entries: (data ?? []).map((row, index) => ({
        rank: index + 1,
        storyId: row.id,
        text: row.text,
        storyName: row.story_name ?? null,
        thatsBadCount: row.sucks_count,
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
