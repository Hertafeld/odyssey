import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, storyId } = body as {
      userId?: string;
      storyId?: string;
    };

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'user_id_required' },
        { status: 400 }
      );
    }
    if (!storyId || typeof storyId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'story_id_required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Verify the story belongs to this user
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, user_id')
      .eq('id', storyId)
      .maybeSingle();

    if (storyError) throw storyError;
    if (!story) {
      return NextResponse.json(
        { success: false, error: 'story_not_found' },
        { status: 404 }
      );
    }
    if (story.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'not_your_story' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
