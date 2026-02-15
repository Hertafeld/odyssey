import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: string };

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'user_id_required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Fetch all votes by this user with the associated story text
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('story_id, vote, created_at, stories(text, story_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (votesError) throw votesError;

    return NextResponse.json({
      success: true,
      votes: (votes ?? []).map((v) => {
        const story = v.stories as unknown as { text: string; story_name: string | null } | null;
        return {
          storyId: v.story_id,
          vote: v.vote,
          createdAt: v.created_at,
          storyText: story?.text ?? '[Deleted]',
          storyName: story?.story_name ?? null,
        };
      }),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
