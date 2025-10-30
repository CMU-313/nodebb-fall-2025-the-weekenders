'use strict';
const assert = require('assert');
const helpers = require('../helpers');

describe('api: users helpfulness', () => {
	it('returns users with helpfulnessScore sorted by helpfulness desc', async () => {
		// Adjust endpoint if your API differs
		const { body } = await helpers.request(
			'get',
			'/api/users?sort=helpfulness',
			{ jar: helpers.request.jar() }
		);
		assert.ok(body && Array.isArray(body.users), 'users array missing');

		if (body.users.length > 1) {
			for (let i = 1; i < body.users.length; i++) {
				const prev = body.users[i - 1].helpfulnessScore || 0;
				const cur = body.users[i].helpfulnessScore || 0;
				assert.ok(prev >= cur, 'users not sorted by helpfulness desc');
			}
		}
	});
});
