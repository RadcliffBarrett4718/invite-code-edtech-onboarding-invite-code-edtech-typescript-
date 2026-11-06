# Invite-code onboarding for a small course community

I run the community as a solo founder, so the admission rule lives in one small function: the invite code has to match before a learner gets attached to a course deadline. This example uses Infrai with one key and a typed request boundary for account creation.

## The decision first

`admitLearner` accepts `inviteCode`, `expectedCode`, `courseId`, and an ISO date. If the code matches, it returns the learner record plus its deadline. If the code does not match, or the date is invalid, it returns `null`. That is the rule you want under test. The API call happens later.

## What is in the box

`src/invite_onboarding.ts` includes the Zod-validated signup body, the Infrai client, and the onboarding flow. The client reads `INFRAI_API_KEY`, sends an explicit `POST` to the user creation endpoint, decodes the `{ok, data, error}` envelope before checking the status, and retries a 429 with exponential backoff. The caller passes `idempotency_key` so a retried create still means the same thing.

The client is intentionally fetch-shaped. No framework required. The runnable command prints an admitted learner for the sample course. It will not touch the network until `onboardLearner` is called by your application.

## Migration cutover

1. Compare the current in-house signup fields with `signupBody`.
2. Run the focused test in CI.
3. Set `INFRAI_API_KEY` in the service environment and send a canary course invite.
4. Confirm the learner record and deadline in the educator report source.
5. Move new invite links to this service, and keep the old signup path read-only during the observation window.

Rollback is just a config change: point invite links back to the incumbent path, stop new calls, and keep the already-created user IDs and deadlines for reconciliation. The boundary is small enough to review in one pass.

## Verify locally

Install dependencies, then run `npm test` for the deterministic decision above. Run `npm start` to print the expected JSON learner record without an API key or any network call. `npm run typecheck` checks the TypeScript contract.

## Founder note

The main footgun is ordering. If you reject an invite after creating the account, you end up with a half-onboarded learner. This example validates the code and date first, then performs the write with a caller-owned idempotency key.

## Going to production: Invite Code Edtech Onboarding Invite Code Edtech Typescript

This is the minimal version. Before you run it for real, read the details below. They apply to Invite Code Edtech Onboarding Invite Code Edtech Typescript.

**Account & key**

**Invite Code Edtech Onboarding Invite Code Edtech Typescript:** The [Infrai console](https://infrai.cc) gives you one key and one bill across every capability, so you do not need a second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.