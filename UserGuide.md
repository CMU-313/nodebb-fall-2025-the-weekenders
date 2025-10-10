# Anonymous Posting Feature

This feature lets users mark their post as Anonymous. When enabled, regular viewers see the post attributed to an anonymous user with a neutral avatar, while the author and staff can still see the original identity.

How to use
- When composing a post, toggle the Anonymous option.
- Submit the post as usual. Others will see it from “Anonymous”; you and staff still see the true author.

Automated tests
- Location: `test/topics/anonymous.test.js`
  - Unit tests for `src/topics/anonymous.js` helper: `toBoolean` and masking behavior across viewer types.
- Location: `test/integration/anonymous-flow.test.js`
  - Integration-style test exercising the masking logic on realistic post objects for non-staff, author, and staff viewers.

Why these tests
- They cover the core logic that drives the front-end display: identity masking rules and truthiness parsing used by the feature flag.
- Together, they validate expected outcomes for all relevant viewer roles.

Running tests
- Ensure NodeBB test runner is set up; then run: `npm test`

Limitations
- The integration test focuses on masking outputs rather than full browser E2E. Add E2E later if required by your team.
