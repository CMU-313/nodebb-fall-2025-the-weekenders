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
