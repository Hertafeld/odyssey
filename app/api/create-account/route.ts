import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, cookieId } = body as {
      email?: string;
      password?: string;
      cookieId?: string;
    };

    const emailTrimmed = typeof email === 'string' ? email.trim() : '';
    const passwordStr = typeof password === 'string' ? password : '';

    if (!emailTrimmed) {
      return NextResponse.json(
        { success: false, error: 'invalid_email' },
        { status: 400 }
      );
    }
    if (!passwordStr) {
      return NextResponse.json(
        { success: false, error: 'password_required' },
        { status: 400 }
      );
    }

    const passwordHash = await hash(passwordStr, 10);
    const supabase = getSupabaseServer();

    const cookieIdTrimmed =
      cookieId != null && typeof cookieId === 'string' ? cookieId.trim() : null;

    // Migrate: temp user exists for this cookie → update that user
    if (cookieIdTrimmed && cookieIdTrimmed.length > 0) {
      const { data: tempUser } = await supabase
        .from('users')
        .select('id')
        .eq('cookie_id', cookieIdTrimmed)
        .maybeSingle();

      if (tempUser) {
        // Email taken only if another user (not this one) has it
        const { data: existingByEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', emailTrimmed)
          .maybeSingle();

        if (existingByEmail && existingByEmail.id !== tempUser.id) {
          return NextResponse.json(
            { success: false, error: 'email_taken' },
            { status: 409 }
          );
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: emailTrimmed,
            password_hash: passwordHash,
            is_temp: false,
          })
          .eq('id', tempUser.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
      }
    }

    // New user: no temp account to migrate (or no cookieId) – email must not be taken
    const { data: existingByEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailTrimmed)
      .maybeSingle();

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'email_taken' },
        { status: 409 }
      );
    }

    const insertPayload: {
      email: string;
      password_hash: string;
      is_temp: boolean;
      cookie_id?: string;
    } = {
      email: emailTrimmed,
      password_hash: passwordHash,
      is_temp: false,
    };
    if (cookieIdTrimmed && cookieIdTrimmed.length > 0) {
      insertPayload.cookie_id = cookieIdTrimmed;
    }

    const { error: insertError } = await supabase.from('users').insert(insertPayload);

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'email_taken' },
          { status: 409 }
        );
      }
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
