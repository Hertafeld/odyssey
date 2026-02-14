import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, userId } = body as { text?: string; userId?: string };

    // TODO: implement – insert story, return new story id
    void text;
    void userId;

    return NextResponse.json({
      success: true,
      storyId: 'stub-story-id',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
