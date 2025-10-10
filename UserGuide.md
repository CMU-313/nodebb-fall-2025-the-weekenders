# Anonymous Posting Feature

This feature lets users mark a post as Anonymous. Regular viewers see an "Anonymous" author with a neutral avatar, while the author and staff see the real identity.

How to use
- In the composer, toggle the Anonymous option and submit.

Automated tests
- test/topics/anonymous.test.js — unit tests for `src/topics/anonymous.js` (`toBoolean`, masking rules).
- test/integration/anonymous-flow.test.js — integration-style checks for masking for non‑staff, author, and staff.

Why these tests
- They validate the core front-end display rules for anonymous identity masking.

Running
- `npm ci`
- `npm test`

---

# Helpfulness (Most Helpful) Feature

This feature shows users ordered by helpfulness and displays a helpfulness badge/count in the UI.

Automated tests
- Unit: `test/users/helpfulness.unit.test.js`
  - Verifies helpfulness score math using set/inc/dec.
- API: `test/api/users.helpfulness.test.js`
  - Verifies the users API includes `helpfulnessScore` and validates descending sort when using the helpfulness sort endpoint.
- UI: `test/ui/most-helpful.test.js`
  - Simulates the UI comparator (descending by `helpfulnessScore`) and badge text (neutral for zero).

Why these tests
- Map to acceptance criteria: score computation, API exposure/sort, and UI sort/badge behavior.

Running
- `npm ci`
- `npm test`
this feature lets users mark their post as Anonymous! whent this iss enabled regular viewers see the post attributed to an anonymous user with a neutral avatar(a question mark) while the author and staff can still see the original identity.

how to use
- when you compose a post toggle the Anonymous option if you want it to be anonymous.
- then submit the post as usual. Others will see it from “Anonymous”; you and staff still see the true author.

Automated tests
- location: `test/topics/anonymous.test.js`
  - unit tests for `src/topics/anonymous.js` helper: `toBoolean` and masking behavior across viewer types.
- location: `test/integration/anonymous-flow.test.js`
  - integration-style test exercising the masking logic on realistic post objects for non-staff, autho, and staff viewers.

Why these tests
- These test help cover tdhe core logic that drives the front-end display: identity masking rules and truthiness parsing used by the feature flag.
- Together, they validate expected outcomes for all relevant viewer roles.

Running tests
- Ensure NodeBB test runner is set up; then run: `npm test`

Limitations
- The integration test focuses on masking outputs rather than full browser E2E. 

