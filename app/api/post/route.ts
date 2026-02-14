import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const MAX_TEXT_LENGTH = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, userId, storyName } = body as {
      text?: string;
      userId?: string;
      storyName?: string;
    };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'text_required' },
        { status: 400 }
      );
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { success: false, error: 'text_too_long' },
        { status: 400 }
      );
    }
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'user_id_required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        text: text.trim(),
        story_name: storyName?.trim() || null,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json(
          { success: false, error: 'invalid_user' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      storyId: data.id,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
