import { test } from "node:test";
import assert from "node:assert/strict";
import { initialJobs, initialPlan, checkPlacement } from "./model.js";
test("date fournisseur, prérequis et occupation bloquent un mauvais créneau", () => {
  const job = { ...initialJobs[0], access: true };
  assert.equal(checkPlacement(job, 3, 1, initialPlan, initialJobs), null);
  assert.ok(checkPlacement(job, 2, 1, initialPlan, initialJobs));
  assert.ok(checkPlacement(job, 3, 2, initialPlan, initialJobs));
  assert.ok(
    checkPlacement({ ...job, duration: 2 }, 4, 1, initialPlan, initialJobs),
  );
  assert.ok(
    checkPlacement(
      { ...job, confirmed: false },
      3,
      1,
      initialPlan,
      initialJobs,
    ),
  );
  assert.ok(
    checkPlacement({ ...job, access: false }, 3, 1, initialPlan, initialJobs),
  );
});
