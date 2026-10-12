# Testing

## Automated (backend running + seeded)
```bash
cd backend && npm run test:cheat
# or against live: API_URL=https://<backend>/api npm run test:cheat
```
It checks: normal claim, unauthorized, forged token, locked days, **concurrent claims (only one wins)**, **fake day/reward/streak/userId ignored**, **duplicate claim rejected**, wallet credited once, claimed/locked states, history.

## Manual test cases
| # | Test | Steps | Expected |
|---|---|---|---|
| 1 | Normal claim | Register, open page, Claim Day 1 | CPA demo, Day 1 Claimed, wallet 5, Day 2 countdown |
| 2 | Already claimed | POST /claim again | 409 ALREADY_CLAIMED/LOCKED, no extra credit |
| 3 | Locked reward | Claim right after Day 1 | 409 LOCKED |
| 4 | Timer | Compare countdown with `nextClaimAt` | Matches server time |
| 5 | Timer elapses | `npm run timetravel -- <email> 1`, refresh | Day 2 AVAILABLE |
| 6 | Missed day | `npm run timetravel -- <email> 60`, refresh | Reset: Day 1 AVAILABLE, STREAK_RESET in auditlogs |
| 7 | Duplicate request | Send claim twice | One success |
| 8 | Concurrent | Two simultaneous claims | One success (+5, not +10) |
| 9 | Fake reward | Body `{day:2,reward:1000000}` | Ignored, real reward granted |
| 10 | Fake day | Body `{day:7}` | Ignored, Day 1 granted |
| 11 | Fake user | Body `{userId:"x"}` | Ignored |
| 12 | Changed device time | Set PC clock +24h, refresh | Still locked |
| 13 | Unauthorized | No/invalid token | 401 |
| 14 | Refresh / logout-login | Reload; log out and in | Same state from MongoDB |
| 15 | Multiple tabs | Claim in tab A, then tab B | Tab B rejected |

## How missed day was tested
`scripts/timeTravel.js` moves the stored `nextClaimAt` into the past (dev DB only). 1h past = unlocked; 60h past = beyond the 24h grace window, so the next status call resets the streak.

## Results
Fill in your actual results/screenshots here after running the tests.
