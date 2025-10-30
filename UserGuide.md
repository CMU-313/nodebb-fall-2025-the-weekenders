# Anonymous Posting Feature

This feature lets users mark their post as Anonymous! When this is enabled regular viewers see the post attributed to an anonymous user with a neutral avatar(a question mark) while the author and staff can still see the original identity.

how to use

- when you compose a post toggle the Anonymous option if you want it to be anonymous.
- then submit the post as usual. Others will see it from “Anonymous”; you and staff still see the true author.

Automated tests

- location: `test/topics/anonymous.test.js`
- unit tests for `src/topics/anonymous.js` helper: `toBoolean` and masking behavior across viewer types.
- location: `test/integration/anonymous-flow.test.js`
- integration-style test exercising the masking logic on realistic post objects for non-staff, author, and staff viewers.

Why these tests

- These tests help cover the core logic that drives the front-end display: identity masking rules and truthiness parsing used by the feature flag.
- Together, they validate expected outcomes for all relevant viewer roles.

Running tests

- Ensure NodeBB test runner is set up; then run: `npm test`

Limitations

- The integration test focuses on masking outputs rather than full browser E2E.

# Endorsed Posts (Instructor “Endorse”) — Front-End Tests

This feature lets staff endorse a reply in a topic. Endorsed replies:

- show an **Endorsed** badge on the post,
- are grouped in an **Endorsed** section placed **right under the original post**, and
- are ordered **by `endorsed_rank` (ascending), then `endorsed_at` (descending)**.
  Unendorsing removes the badge and returns the post to the normal list. The UI updates **without a full page reload**.

## How to use

- As staff, open a post’s menu (3 dots) and click **Endorse**.  
  The post moves into the Endorsed section and displays the badge.
- To undo, choose **Unendorse** from the same menu.

## Automated tests

- **Location:** `test/frontend_endorse.js`
- **What’s covered (unit):**
  - Ordering logic places endorsed posts first, sorted by **rank asc, then time desc**.
  - Missing ranks are treated as **Infinity**.
  - Non-endorsed posts keep their **original relative order**.
  - UI markers: applying endorsed state adds the badge + data attributes; removing it clears them.

## Running tests

npm test -- test/frontend_endorse.js

# Helpfulness Score Feature

This feature introduces a “helpfulness score” tired to post upvotes, giving users feedback on their impact in discussions

## How to use

- Post helpful content in discussions
- When other users upvote your posts, your helpfulness score increases automatically

## Automated Tests

**Location:** test/user/helpfulness.js
**What’s Covered:**
Core Tests (4 tests):

- Get user’s helpfulness score
- Set user’s helpfulness score
- Increment user's helpfulness score
- Recompute helpfulness score from user's post

**Integration Tests (2 tests):**

- Updates helpfulness when post is upvoted
- Includes helpfulness score in user data

**Edge Cases (2 tests):**

- Handles invalid UIDs
- Resets score to 0 for users with no posts

## Why These Tests Are Sufficient:

- Core tests validate all CRUD operations on helpfulness scores
- Integration tests ensure the voting system properly triggers helpfulness updates
- Edge case tests handle error scenarios and data integrity

## Running Tests:

npm test test/user/helpfulness.js

## Limitations/Risks:

- Minimal risk; isolated to new helpfulness logic
- Score only increases with upvotes

# Endorsed Posts Feature

This feature implements instructor-endorsed tags for posts, allowing instructors and moderators to mark high-quality posts as endorsed. This helps students identify valuable content and quality contributions in forum discussions.
encourages

## How to use

- Navigate to any post in a discussion
- Select "Endorse"
- The post immediately shows an "Endorsed" badge and moves to the top of the thread
- A success toast appears: "Post endorsed"
- To remove: Click "Unendorse" from the same menu

## Automated Tests

**Location:** test/posts/endorse.js

**Core Tests (3 tests)**

- Endorse a post with a timestamp
- Unendorse a post
- Post data includes endorsement fields (endorsed, endorse_at, endorsed_atISO)

** API & Permissions Tests (3 tests)**

- Admins/Staff can endorse posts via API
- Admins/Staff can unendorse posts via API
- Regular users can't endorse (permission check enforced)

**Error Handling Tests (2 tests)**

- Handles non-existent post IDs
- Validates missing/invalid data

## Why These Tests Are Sufficient:

- Core tests verify the fundamental endorse/unendorse operations work correctly and data structures include all required fields
- API & Permission tests ensure authorization is properly enforced
- Error handling tests validate the system handles invalid inputs and edge cases

## Running Tests

npm test test/posts/endorse.js

## Limitations/Risks:

- Minimal risk: isolated to new endorsement logic
- Only instructors and staff can endorse posts
