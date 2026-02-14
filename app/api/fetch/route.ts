import { NextResponse } from 'next/server';

const HARDCODED_STORIES = [
  { storyId: 'hc-1', text: 'He brought his mom to our first date. She ordered for him.', storyName: 'MommasBoy_Run' },
  { storyId: 'hc-2', text: 'She spent 20 minutes explaining why the earth is flat. We were at a planetarium.', storyName: 'ScienceGuy' },
  { storyId: 'hc-3', text: 'He forgot his wallet, so I paid. Then he asked for the receipt to expense it.', storyName: 'CorporateGreed' },
  { storyId: 'hc-4', text: 'She Googled my name during dinner and read my LinkedIn out loud.', storyName: 'RecruiterVibes' },
  { storyId: 'hc-5', text: 'He said his ex was "crazy" and then his ex showed up. She was not crazy.', storyName: 'RedFlagCentral' },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: string };

    // TODO: replace with DB – pick random unseen story for user
    void userId;

    const story = HARDCODED_STORIES[Math.floor(Math.random() * HARDCODED_STORIES.length)];

    return NextResponse.json({
      success: true,
      hasStory: true,
      story,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
