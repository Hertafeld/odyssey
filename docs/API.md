# I've Had Worse – API summary

All endpoints are **POST** (except where noted), JSON request/response. Base path: `/api` (e.g. `POST /api/login`).

---

## 1. Login

**POST** `/api/login`

Get or create a user and get a `userId` for later requests. Use **either** cookie-based (temp) **or** email/password (real account), not both in one request.

**Request body (pick one):**

| Shape | When to use |
|-------|---------------------|
| `{ "cookieId": "string" }` | First load / anonymous. Send the client’s cookie ID; backend finds or creates a temp user. |
| `{ "email": "string", "password": "string" }` | Returning user with a real account. |

**Success response (200):**

```json
{
  "success": true,
  "userId": "<uuid>",
  "isTempAccount": true
}
```

- `isTempAccount: true` → temp user (cookie). You may show “Create account” to migrate.
- `isTempAccount: false` → real account (email/password).

**Error response (4xx):**

```json
{ "success": false, "error": "invalid_credentials" }
```

or

```json
{ "success": false, "error": "invalid_request", "details": "..." }
```

**Usage:** On first page load, call with `cookieId` (from your own cookie/localStorage) to get a `userId`. Store `userId` (and optionally `isTempAccount`) in state or storage and send it on Post, Vote, and Fetch. For “Log in” with email/password, call with `email` and `password` and use the returned `userId` the same way.

---

## 2. Create account

**POST** `/api/create-account`

Create a permanent account (email + password). If the user had a temp account, pass `cookieId` so that account is migrated (same `userId`, keeps votes/stories).

**Request body:**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `email` | string | Yes | Trimmed; must be unique across users. |
| `password` | string | Yes | Plain text; server hashes before storing. |
| `cookieId` | string | No | If present and a temp user exists with this `cookie_id`, that user is updated to this email/password (migration). |

**Success response (200):**

```json
{ "success": true }
```

**Error response (4xx):**

```json
{ "success": false, "error": "email_taken" }
```

or `invalid_email` / `password_required` / `invalid_request`.

**Usage:** After “Sign up” form submit. If the user was previously logged in as temp, send the same `cookieId` you used for Login so their history is kept.

---

## 3. Post (submit story)

**POST** `/api/post`

Submit a new story for the current user.

**Request body:**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `text` | string | Yes | Story content. Max 3000 characters. |
| `userId` | string | Yes | From Login (or stored after login). |
| `storyName` | string | No | Display name / nickname for the story (e.g. “Anonymous”). |

**Success response (200):**

```json
{
  "success": true,
  "storyId": "<uuid>"
}
```

**Error response (4xx):**

```json
{ "success": false, "error": "text_required" }
```

or `text_too_long`, `user_id_required`, `invalid_user`, `invalid_request`.

**Usage:** After “Submit story” in the share modal. Send the current `userId` and the story `text` (and optional `storyName`). You can use `storyId` for confirmation or deep links.

---

## 4. Vote

**POST** `/api/vote`

Record a vote on a story. One vote per user per story; sending again overwrites (e.g. change from “sucks” to “ive_had_worse”).

**Request body:**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `storyId` | string | Yes | UUID of the story (from Fetch or Post). |
| `userId` | string | Yes | Current user. |
| `vote` | string | Yes | Must be `"sucks"` or `"ive_had_worse"`. |

**Success response (200):**

```json
{ "success": true }
```

**Error response (4xx):**

```json
{ "success": false, "error": "story_id_required" }
```

or `user_id_required`, `invalid_vote`, `invalid_user_or_story`, `invalid_request`.

**Usage:** When the user swipes or taps a vote (e.g. left = “I’ve had worse” → `"ive_had_worse"`, right = “That’s bad” → `"sucks"`). Send the current story’s `storyId` and the stored `userId`.

---

## 5. Fetch (next story)

**POST** `/api/fetch`

Get one random story the user hasn’t voted on yet (or signal that there are none).

**Request body:**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `userId` | string | Yes | |
| `excludeStoryIds` | string[] | No | Story IDs to exclude (e.g. current story when pre-fetching the next). Avoids returning the same story twice. |

**Success response (200) – story available:**

```json
{
  "success": true,
  "hasStory": true,
  "story": {
    "storyId": "<uuid>",
    "text": "<story content>",
    "storyName": "<nickname or null>"
  }
}
```

**Success response (200) – no unseen stories:**

```json
{
  "success": true,
  "hasStory": false
}
```

(No `story` field. Use this to show “You’re all caught up” or similar.)

**Error response (4xx):**

```json
{ "success": false, "error": "user_id_required" }
```

or `invalid_request`.

**Usage:** When loading the next card (e.g. on initial load or after a vote). Send the stored `userId`. Optionally send `excludeStoryIds: [currentStoryId]` when pre-fetching the next story so the API won’t return the same story. If `hasStory: true`, render `story.text` and `story.storyName` and keep `story.storyId` for the next Vote call. If `hasStory: false`, show the empty state.

---

## Quick reference

| Endpoint | Method | Request body | Returns |
|----------|--------|--------------|---------|
| Login | POST | `{ cookieId }` **or** `{ email, password }` | `userId`, `isTempAccount` |
| Create account | POST | `{ email, password, cookieId? }` | `success` |
| Post | POST | `{ text, userId, storyName? }` | `storyId` |
| Vote | POST | `{ storyId, userId, vote }` | `success` |
| Fetch | POST | `{ userId, excludeStoryIds? }` | `hasStory`, `story?` |

**Vote values:** `"sucks"` | `"ive_had_worse"` (lowercase, with underscore).

**Auth:** No sessions. Store `userId` (and optionally `isTempAccount`) after Login and send `userId` on Post, Vote, and Fetch. Use `cookieId` only for the first Login and for Create account when migrating a temp user.
