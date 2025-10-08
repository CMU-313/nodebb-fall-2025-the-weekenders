'use strict';

const assert = require('assert');
const db = require('../mocks/databasemock');
const posts = require('../../src/posts');
const topics = require('../../src/topics');
const categories = require('../../src/categories');
const user = require('../../src/user');
const groups = require('../../src/groups');
const api = require('../../src/api');

describe('Post Endorsement', () => {
	let adminUid;
	let regularUid;
	let category;
	let pid;

	before(async () => {
		// Create test users
		adminUid = await user.create({ username: 'endorseadmin', password: '123456' });
		regularUid = await user.create({ username: 'regularuser', password: '123456' });
		await groups.join('administrators', adminUid);

		// Create test category and post
		category = await categories.create({ name: 'Test Category' });
		const result = await topics.post({
			uid: regularUid,
			cid: category.cid,
			title: 'Test Topic',
			content: 'Test post content',
		});
		pid = result.postData.pid;
	});

	it('should endorse a post', async () => {
		const result = await posts.endorse(pid);

		assert.strictEqual(result.endorsed, true);
		assert(result.endorsed_at, 'should have timestamp');
		assert.strictEqual(result.pid, Number(pid));
	});
});