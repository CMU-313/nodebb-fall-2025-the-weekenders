# Anonymous Posting Feature

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

