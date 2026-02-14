import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, cookieId } = body as {
      email?: string;
      password?: string;
      cookieId?: string;
    };

    // TODO: implement – validate email/password, migrate temp user if cookieId, create/update user
    void email;
    void password;
    void cookieId;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
