import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyId, userId, vote } = body as {
      storyId?: string;
      userId?: string;
      vote?: string;
    };

    // TODO: implement – upsert vote, update story counts
    void storyId;
    void userId;
    void vote;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
