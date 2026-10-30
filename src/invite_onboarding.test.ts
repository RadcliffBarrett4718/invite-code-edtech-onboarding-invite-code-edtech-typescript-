import test from "node:test";
import assert from "node:assert/strict";
import { admitLearner } from "./invite_onboarding.ts";

test("only the course invite code admits a learner and preserves the deadline", () => {
  assert.deepEqual(admitLearner("EDU-2026", "EDU-2026", "typescript-101", "2026-11-30"), {
    userId: "pending", courseId: "typescript-101", deadline: "2026-11-30"
  });
  assert.equal(admitLearner("wrong", "EDU-2026", "typescript-101", "2026-11-30"), null);
});
