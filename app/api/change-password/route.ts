import { NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body as {
      userId?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'user_id_required' },
        { status: 400 }
      );
    }
    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'current_password_required' },
        { status: 400 }
      );
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'new_password_too_short' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, is_temp, password_hash')
      .eq('id', userId)
      .maybeSingle();

    if (userError) throw userError;
    if (!user || user.is_temp || !user.password_hash) {
      return NextResponse.json(
        { success: false, error: 'invalid_user' },
        { status: 400 }
      );
    }

    const match = await compare(currentPassword, user.password_hash);
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'wrong_password' },
        { status: 401 }
      );
    }

    const newHash = await hash(newPassword, 12);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
