# API Documentation
Base URL: `http://localhost:5000/api`. All `/daily-streak/*` routes require `Authorization: Bearer <token>`.
Errors are always `{ "success": false, "message": "<safe message>", "code": "..." }` — raw database errors are never exposed.

## Auth
### POST /auth/register
Body: `{ "name", "email", "password" }` -> `201 { success, token, user }`. `409` if the email exists.
### POST /auth/login
Body: `{ "email", "password" }` -> `200 { success, token, user }`. `401` on bad credentials.

## Daily streak
### GET /daily-streak and GET /daily-streak/status
Returns the full state. Everything is computed on the server.
```json
{
  "success": true,
  "serverTime": "2026-10-05T10:00:00.000Z",
  "streak": { "currentStreak": 1, "currentDay": 2, "checkedIn": 1, "totalRewards": 7,
    "status": "ACTIVE", "isAvailableNow": false, "nextClaimAt": "2026-10-06T10:00:00.000Z",
    "nextReward": { "day": 2, "amount": 10, "currency": "VES", "type": "VES" } },
  "rewards": [
    { "day": 1, "status": "CLAIMED", "isToday": false, "reward": { "type": "VES", "currency": "VES", "amount": 5, "title": "Daily Reward", "subtitle": "5 VEs", "assetType": "coin", "isUltimate": false } },
    { "day": 2, "status": "LOCKED", "isToday": true, "nextClaimAt": "2026-10-06T10:00:00.000Z", "reward": { "...": "..." } }
  ]
}
```
Card `status`: `CLAIMED | AVAILABLE | LOCKED | MISSED`. A missed streak is reset server-side and the response shows Day 1 AVAILABLE.

### POST /daily-streak/claim
Body: ignored (send `{}`). Any `day`, `reward`, `amount`, `currency`, `streak`, `userId` is discarded.
- `200` `{ success, day, reward, transaction: { transactionId, referenceId, balanceBefore, balanceAfter }, streak }`
- `409` `{ code: "LOCKED" }` — "Your next reward is not available yet."
- `409` `{ code: "ALREADY_CLAIMED" }` — "This reward has already been claimed." (duplicate/concurrent)
- `401` not logged in · `429` rate limited · `500` "Unable to process your reward. Please try again."

### GET /daily-streak/history
`{ success, history: [{ day, claimedAt, reward, transaction }] }` (newest first, only the caller's claims).

### GET /daily-streak/wallet
`{ success, balances: { "VES": 5 } }`

### GET /health
`{ status: "ok", time }` (no auth).
