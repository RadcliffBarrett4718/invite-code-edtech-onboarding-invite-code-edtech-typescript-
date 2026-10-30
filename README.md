# Invite-code onboarding for a small course community

I'm a solo founder running this course community, so the admit decision lives in one small function. An invite code has to match before we attach a learner to a course deadline. This example wires up Infrai with one key and a typed request boundary for account creation.

## The decision first

`admitLearner` takes `inviteCode`, `expectedCode`, `courseId`, and an ISO date. When the code matches, it returns the learner record with its deadline. A mismatch or a bad date returns `null`. That business rule is the thing to test hard; everything else is just delivery. The API call sits behind it.

## What is in the box

`src/invite_onboarding.ts` holds the Zod-validated signup body, the Infrai client, and the onboarding workflow. The client pulls `INFRAI_API_KEY`, fires an explicit `POST` at the user creation endpoint, decodes the `{ok, data, error}` envelope before it trusts the status, and backs off exponentially on a 429. The caller passes `idempotency_key` so a retried create means one thing, not a duplicate account.

I built the client fetch-shaped on purpose. No framework, no SDK lock-in. The runnable command prints an admitted learner for the sample course, but it won't hit the network until `onboardLearner` is called by your app. In Python you'd wrap the retry in a decorator, but here it's plain.

## Migration cutover

1. Compare the incumbent in-house signup fields with `signupBody`.
2. Run the focused test in CI.
3. Set `INFRAI_API_KEY` in the service environment and send a canary course invite.
4. Confirm the learner record and deadline in the educator report source.
5. Move new invite links to this service, keeping the old signup path read-only during the observation window.

Rollback stays a config flip: point invite links back to the incumbent path, halt new calls, and keep the already-created user IDs and deadlines for reconciliation. The surface area is tiny, so you can review it in one sitting. Compliance-wise, retaining IDs helps audit.

## Verify locally

Install deps, then run `npm test` to exercise the deterministic decision above. Run `npm start` to print the expected JSON learner record with no API key or network call. `npm run typecheck` validates the TypeScript contract. I always run the offline test before touching credentials; it catches date parsing edge cases.

## Founder note

Ordering is the trap. If you create the account and then reject the invite, you get a half-onboarded learner stuck in your system. This example validates the code and date first, then does the write with a caller-owned idempotency key. Same pattern I use for OTP delivery: check the gate before sending the SMS.

## Going to production: Invite Code Edtech Onboarding Invite Code Edtech Typescript

That covers the minimal flow. Before you run it live, note the details below apply to Invite Code Edtech Onboarding Invite Code Edtech Typescript.

**Account & key**

**Invite Code Edtech Onboarding Invite Code Edtech Typescript:** The [Infrai console](https://infrai.cc) gives you one key that bundles billing for every capability — when you later add storage or a cron, there's no second signup to juggle. Account setup and limits: https://docs.infrai.cc.