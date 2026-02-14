import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cookieId, email, password } = body as {
      cookieId?: string;
      email?: string;
      password?: string;
    };

    // TODO: implement – cookieId → find or create temp user; email+password → verify and return user
    void cookieId;
    void email;
    void password;

    return NextResponse.json({
      success: true,
      userId: 'stub-user-id',
      isTempAccount: true,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
