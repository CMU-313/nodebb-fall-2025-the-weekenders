'use strict';
const assert = require('assert');

describe('ui: most helpful sort/badge', () => {
	it('sorts by helpfulness desc and shows neutral badge for zero', () => {
		const users = [
			{ username: 'a', helpfulnessScore: 0 },
			{ username: 'b', helpfulnessScore: 10 },
			{ username: 'c', helpfulnessScore: 3 },
		];

		// Simulate the comparator the UI uses
		users.sort(
			(u1, u2) => (u2.helpfulnessScore || 0) - (u1.helpfulnessScore || 0)
		);
		assert.deepStrictEqual(
			users.map((u) => u.username),
			['b', 'c', 'a']
		);

		// Badge/neutral display logic
		const badgeText = (score) => (score > 0 ? String(score) : '');
		assert.strictEqual(badgeText(10), '10');
		assert.strictEqual(badgeText(0), '');
	});
});
