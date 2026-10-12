# VELoop Rewards — Daily Streak System

A full-stack MERN feature where an authenticated user checks in daily, keeps a consecutive-day streak, and unlocks increasingly valuable rewards.

> **Fundamental rule: React controls the presentation. The backend controls the streak.**

## Tech stack
MongoDB (Atlas) · Express.js · React (Vite) · Node.js · Mongoose · JWT · Bootstrap 5 · CSS Modules · Lucide React · React Router · Axios

## Architecture
```
React (UI only) -> streakApi.js -> Express REST API -> services -> MongoDB
```
- `backend/src/models` — User, Wallet, StreakReward, StreakCycle, StreakClaim, WalletTransaction, AuditLog
- `backend/src/services` — `streak.service.js` (all business logic), `reward.service.js`, `wallet.service.js`
- `backend/src/controllers|routes|middleware` — thin HTTP layer, JWT auth, rate limiting
- `frontend/src/services` — centralized API layer; `hooks/` — streak data + server-synced countdown
- `frontend/src/components` — header, hero, stats, ultimate reward, reward cards/grid, CPA demo, loader, skeleton, footer

## Installation
```bash
git clone <your-repo-url> && cd veloop-daily-streak

# Backend
cd backend && npm install
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm run seed                # seeds the 7 rewards into MongoDB
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd frontend && npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

## Environment variables
| Backend | Purpose |
|---|---|
| `PORT` | Server port |
| `MONGO_URI` | Your own MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string |
| `JWT_EXPIRES_IN` | Token lifetime (default 7d) |
| `CLIENT_ORIGIN` | Frontend URL allowed by CORS |
| `STREAK_CLAIM_INTERVAL_HOURS` | Wait between claims (default 24) |
| `STREAK_MISS_GRACE_HOURS` | Window to claim before streak resets (default 24) |
| `STREAK_CYCLE_LENGTH` | Days per cycle (default 7) |

Frontend: `VITE_API_URL`. Real secrets are never committed (`.env` is git-ignored).

## Database schema
See [docs/DATABASE.md](docs/DATABASE.md).

## Streak logic
Each user has one **ACTIVE StreakCycle** (a 7-day run). It stores `currentDay` (the next day to claim), `lastClaimedAt` and `nextClaimAt`. A new user gets a cycle at Day 1 with `nextClaimAt = null` (claimable now). Card states (`CLAIMED / AVAILABLE / LOCKED / MISSED`) are computed by the backend in `getStreakStatus()`.

## Claim logic
`POST /api/daily-streak/claim` accepts **no trusted input**. The user comes from the JWT; the day comes from `cycle.currentDay`; the reward comes from the `StreakReward` collection. Steps: authenticate -> missed-day check -> eligibility (server time >= `nextClaimAt`) -> start a MongoDB transaction -> atomically advance the cycle only if it is still on the expected day -> credit wallet -> write ledger transaction -> write StreakClaim -> audit log. Day N+1 can only be reached by claiming Day N, so previous-day validation and sequential claiming are structural.

## Timer architecture
The API returns `serverTime` and `nextClaimAt`. The frontend computes `offset = serverTime - deviceTime` once and counts down using that offset, so changing the device clock does nothing. When the timer reaches zero the frontend re-fetches `/status`; the claim button only appears if the backend says `AVAILABLE`. The claim endpoint re-checks server time regardless.

## Reset logic
If server time passes `nextClaimAt + MISS_GRACE_HOURS`, the cycle is marked `RESET`, a new Day 1 cycle is created, and a `STREAK_RESET` audit event is written. This runs on every status fetch and claim, using server time only — closing the browser never resets anything.

## Reward system & wallet
Rewards live in MongoDB (`StreakReward`), seeded by `npm run seed`. Change a reward in the DB and the UI updates with no code change. VES rewards credit the wallet; every credit writes a `WalletTransaction` with `balanceBefore/After` and a `STREAK-XXXXXXXX` reference.

## Security
See [docs/SECURITY.md](docs/SECURITY.md). Summary: JWT-derived identity, ignored client fields, server time, unique index + optimistic lock + transaction for duplicates/concurrency, rate limiting, safe error messages, audit logs.

## API endpoints
See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) and `postman/`.

## Testing
See [docs/TESTING.md](docs/TESTING.md). Quick run: `cd backend && npm run test:cheat`.

## Deployment
- **Database:** MongoDB Atlas (free M0)
- **Backend:** Render/Railway — root dir `backend`, build `npm install`, start `npm start`, set env vars (`CLIENT_ORIGIN` = your Vercel URL). Run `npm run seed` once against the Atlas DB.
- **Frontend:** Vercel/Netlify — root dir `frontend`, build `npm run build`, output `dist`, set `VITE_API_URL=https://<backend>/api`.

## Known limitations
- CPA/ad step is a visual placeholder only (by design; the real integration comes later).
- Reward visuals use Lucide icons as placeholders until the supplied design assets are swapped in; no animated assets yet.
- After Day 7 completes, a new cycle starts at Day 1 immediately on the next visit (platform rule can be changed in `streak.service.js`).
- Gift-card rewards are recorded in the wallet ledger (INR) but no real payout is integrated.
- Layout is responsive (4/3/2/1 column grids) but not yet pixel-tuned to the mobile reference.
