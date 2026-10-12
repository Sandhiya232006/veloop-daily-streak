// Automated anti-cheat tests. Run against a RUNNING server:
//   node scripts/cheatTests.js                       (local)
//   API_URL=https://your-api.onrender.com/api node scripts/cheatTests.js
const BASE = process.env.API_URL || 'http://localhost:5000/api';

async function call(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try { json = await res.json(); } catch (e) { /* ignore */ }
  return { status: res.status, body: json };
}

let passed = 0, failed = 0;
function check(name, condition) {
  if (condition) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
}

(async () => {
  console.log(`Testing ${BASE}\n`);
  const email = `tester${Date.now()}@example.com`;

  let r = await call('POST', '/auth/register', { name: 'Tester', email, password: 'secret123' });
  check('register works and returns a token', r.status === 201 && !!r.body.token);
  const token = r.body.token;

  r = await call('GET', '/daily-streak/status');
  check('unauthorized request is rejected (401)', r.status === 401);

  r = await call('GET', '/daily-streak/status', null, token);
  check('new user starts at Day 1 and Day 1 is AVAILABLE',
    r.body.streak?.currentDay === 1 && r.body.rewards?.[0]?.status === 'AVAILABLE');
  check('Day 2..7 are LOCKED', r.body.rewards?.slice(1).every((c) => c.status === 'LOCKED'));

  // Fake day + fake reward + fake streak + fake userId, sent TWICE AT THE SAME TIME
  const evil = { day: 7, reward: 1000000, amount: 999, currency: 'VES', streak: 7, userId: 'someoneElse' };
  const [a, b] = await Promise.all([
    call('POST', '/daily-streak/claim', evil, token),
    call('POST', '/daily-streak/claim', evil, token),
  ]);
  const wins = [a, b].filter((x) => x.status === 200);
  check('CONCURRENT claims: exactly one succeeds', wins.length === 1);
  check('FAKE day/reward/streak/user ignored: got Day 1 for +5 VES',
    wins[0]?.body.day === 1 && wins[0]?.body.reward?.amount === 5);

  r = await call('POST', '/daily-streak/claim', {}, token);
  check('DUPLICATE / LOCKED claim is rejected (409)', r.status === 409);

  r = await call('GET', '/daily-streak/wallet', null, token);
  check('wallet credited exactly once (VES = 5)', r.body.balances?.VES === 5);

  r = await call('GET', '/daily-streak/status', null, token);
  check('Day 1 CLAIMED, Day 2 LOCKED with a server nextClaimAt',
    r.body.rewards?.[0]?.status === 'CLAIMED' && !!r.body.rewards?.[1]?.nextClaimAt && !!r.body.serverTime);
  check('checkedIn = 1', r.body.streak?.checkedIn === 1);

  r = await call('GET', '/daily-streak/history', null, token);
  check('history has exactly 1 claim', r.body.history?.length === 1);

  r = await call('GET', '/daily-streak/status', null, 'not.a.real.token');
  check('forged token is rejected (401)', r.status === 401);

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log(`(Test user: ${email}  <- use this with scripts/timeTravel.js to test missed day)`);
  process.exit(failed ? 1 : 0);
})();
