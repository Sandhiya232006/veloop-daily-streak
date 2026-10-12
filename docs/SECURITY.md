# Security

| Threat | Defence |
|---|---|
| Change streak/day in DevTools | Frontend never holds business state; every render uses the API response; claim takes no input |
| Fake reward/amount/currency | Claim reads reward from `StreakReward` in MongoDB; body is ignored |
| Jump to Day 7 | Day = `cycle.currentDay` server-side; Day N+1 only reachable after claiming Day N |
| Device clock change | All checks use server `new Date()`; countdown uses server offset; claim re-validates |
| Duplicate / double click | Unique index (userId, cycleId, day) + atomic conditional update on the cycle |
| Concurrent requests | `findOneAndUpdate` matched on `currentDay` inside a MongoDB transaction; losers get `ALREADY_CLAIMED` |
| Fake userId / cross-user access | Identity only from verified JWT (`req.userId`); every query filters by it |
| Brute force / spam | `express-rate-limit` on auth (20/15min) and claim (10/min) |
| Info leakage | Controllers map errors to fixed safe messages; global error handler |
| Secrets | `.env` git-ignored; only `.env.example` committed; passwords hashed with bcrypt |
| Forensics | AuditLog records requests, successes, rejections, duplicates, resets |

Note: the JWT is stored in `localStorage` (simple for this project). A production system would prefer httpOnly cookies.
