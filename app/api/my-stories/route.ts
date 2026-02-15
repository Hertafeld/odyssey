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

    // Verify user exists and is not a temp account
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, is_temp, email, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'invalid_user' },
        { status: 400 }
      );
    }
    if (user.is_temp) {
      return NextResponse.json(
        { success: false, error: 'sign_in_required' },
        { status: 403 }
      );
    }

    // Fetch all stories by this user, newest first
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, text, story_name, sucks_count, ive_had_worse_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (storiesError) throw storiesError;

    return NextResponse.json({
      success: true,
      account: {
        email: user.email ?? null,
        createdAt: user.created_at,
      },
      stories: (stories ?? []).map((s) => ({
        id: s.id,
        text: s.text,
        storyName: s.story_name,
        sucksCount: s.sucks_count,
        iveHadWorseCount: s.ive_had_worse_count,
        createdAt: s.created_at,
      })),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
