'use strict';

const assert = require('assert');

describe('integration: anonymous post masking flow', function () {
	this.timeout(30000);

	it('masks for non-staff and not for author/staff', async () => {
		const anon = require('../../src/topics/anonymous');
		const post = {
			uid: 101,
			isAnonymous: 1,
			user: { username: 'Alice' },
			userslug: 'alice',
		};

		const other = JSON.parse(JSON.stringify(post));
		anon.applyAnonymousMask(other, 999, false);
		assert.strictEqual(other.uid, 0);
		assert.strictEqual(other.user.username, 'Anonymous');
		assert.strictEqual(other.userslug, undefined);

		const self = JSON.parse(JSON.stringify(post));
		anon.applyAnonymousMask(self, 101, false);
		assert.strictEqual(self.uid, 101);
		assert.strictEqual(self.user.username, 'Alice');

		const staff = JSON.parse(JSON.stringify(post));
		anon.applyAnonymousMask(staff, 2, true);
		assert.strictEqual(staff.uid, 101);
		assert.strictEqual(staff.user.username, 'Alice');
	});
});
