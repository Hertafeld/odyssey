import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cookieId, email, password } = body as {
      cookieId?: string;
      email?: string;
      password?: string;
    };

    const supabase = getSupabaseServer();

    // Email + password: real account login
    if (email != null && password != null && typeof email === 'string' && typeof password === 'string') {
      const emailTrimmed = email.trim();
      if (!emailTrimmed) {
        return NextResponse.json(
          { success: false, error: 'invalid_credentials' },
          { status: 401 }
        );
      }

      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('id, password_hash, is_temp')
        .eq('email', emailTrimmed)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!user || !user.password_hash) {
        return NextResponse.json(
          { success: false, error: 'invalid_credentials' },
          { status: 401 }
        );
      }

      const match = await compare(password, user.password_hash);
      if (!match) {
        return NextResponse.json(
          { success: false, error: 'invalid_credentials' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        userId: user.id,
        isTempAccount: user.is_temp ?? true,
      });
    }

    // Cookie ID only: temp user (find or create)
    if (cookieId != null && typeof cookieId === 'string' && cookieId.trim().length > 0) {
      const id = cookieId.trim();

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('cookie_id', id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          success: true,
          userId: existing.id,
          isTempAccount: true,
        });
      }

      const { data: created, error: insertError } = await supabase
        .from('users')
        .insert({ cookie_id: id, is_temp: true })
        .select('id')
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        userId: created.id,
        isTempAccount: true,
      });
    }

    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: 'invalid_request', details: message },
      { status: 400 }
    );
  }
}
