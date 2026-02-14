import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const VALID_VOTES = ['sucks', 'ive_had_worse'] as const;
type VoteValue = (typeof VALID_VOTES)[number];

function isValidVote(v: unknown): v is VoteValue {
  return typeof v === 'string' && VALID_VOTES.includes(v as VoteValue);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyId, userId, vote } = body as {
      storyId?: string;
      userId?: string;
      vote?: string;
    };

    if (!storyId || typeof storyId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'story_id_required' },
        { status: 400 }
      );
    }
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'user_id_required' },
        { status: 400 }
      );
    }
    if (!isValidVote(vote)) {
      return NextResponse.json(
        { success: false, error: 'invalid_vote' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { data: existingVote } = await supabase
      .from('votes')
      .select('vote')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .maybeSingle();

    const { error: upsertError } = await supabase.from('votes').upsert(
      {
        user_id: userId,
        story_id: storyId,
        vote,
      },
      { onConflict: 'user_id,story_id' }
    );

    if (upsertError) {
      if (upsertError.code === '23503') {
        return NextResponse.json(
          { success: false, error: 'invalid_user_or_story' },
          { status: 400 }
        );
      }
      throw upsertError;
    }

    const oldVote: VoteValue | null = existingVote?.vote ?? null;
    const newVote = vote as VoteValue;

    if (oldVote !== newVote) {
      const { data: story } = await supabase
        .from('stories')
        .select('sucks_count, ive_had_worse_count')
        .eq('id', storyId)
        .single();

      if (!story) {
        return NextResponse.json(
          { success: false, error: 'invalid_story' },
          { status: 400 }
        );
      }

      let sucks = story.sucks_count;
      let iveHadWorse = story.ive_had_worse_count;

      if (oldVote === 'sucks') sucks -= 1;
      else if (oldVote === 'ive_had_worse') iveHadWorse -= 1;

      if (newVote === 'sucks') sucks += 1;
      else if (newVote === 'ive_had_worse') iveHadWorse += 1;

      const { error: updateError } = await supabase
        .from('stories')
        .update({ sucks_count: sucks, ive_had_worse_count: iveHadWorse })
        .eq('id', storyId);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
