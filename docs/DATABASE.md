# Database Schema (MongoDB / Mongoose)

| Collection | Key fields | Notes |
|---|---|---|
| `users` | name, email (unique), passwordHash, active | `active` = account eligibility check |
| `wallets` | userId (unique), balances (Map currency->number) | one per user |
| `streakrewards` | day (unique), rewardType, currency, amount, title, subtitle, assetType, isUltimate, active, metadata | **Reward config. Edit here, UI follows.** |
| `streakcycles` | userId, cycleNumber, status (ACTIVE/COMPLETED/RESET), currentDay, lastClaimedAt, nextClaimAt | **Partial unique index:** only one ACTIVE cycle per user |
| `streakclaims` | userId, cycleId, day, rewardId, transactionId, claimedAt | **Unique index (userId, cycleId, day)** blocks duplicate claims |
| `wallettransactions` | transactionId (unique), userId, currency, type, amount, source, referenceId, streakDay, balanceBefore, balanceAfter, status | The ledger |
| `auditlogs` | userId, event, details | STREAK_CLAIM_REQUEST / SUCCESS / REJECTED, STREAK_RESET, DUPLICATE_CLAIM, INVALID_CLAIM |

## Traceability
`StreakClaim.rewardId -> StreakReward`, `StreakClaim.transactionId -> WalletTransaction` (with balanceBefore/After) -> `Wallet.balances`. After any claim, an evaluator can follow this chain in Atlas.

## Cycle approach
Each 7-day run is one `StreakCycle`. Missing the window marks it `RESET` and opens a new cycle. Finishing Day 7 marks it `COMPLETED` and the next visit opens a new cycle.
