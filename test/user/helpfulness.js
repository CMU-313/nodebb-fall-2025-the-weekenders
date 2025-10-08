'use strict';

const assert = require('assert');
const db = require('../mocks/databasemock');
const user = require('../../src/user');
const topics = require('../../src/topics');
const categories = require('../../src/categories');
const posts = require('../../src/posts');
const helpfulness = require('../../src/user/helpfulness');

describe('User Helpfulness', () => {
	let testUid;
	let category;
	let topic;
	let pid;

	before(async () => {
		// Create test user
		testUid = await user.create({ username: 'helpfuluser', password: '123456' });

		// Create test category
		category = await categories.create({ name: 'Test Category' });

		// Create test topic and post
		const result = await topics.post({
			uid: testUid,
			cid: category.cid,
			title: 'Test Topic',
			content: 'Test post content',
		});
		topic = result.topicData;
		pid = result.postData.pid;
	});

	it('should get a user\'s helpfulness score', async () => {
		const score = await helpfulness.get(testUid);
		
		assert.strictEqual(typeof score, 'number');
		assert.strictEqual(score, 0); 
	});

	it('should set a user\'s helpfulness score', async () => {
		const newScore = await helpfulness.set(testUid, 10);
		
		assert.strictEqual(newScore, 10);
		
		
		const retrieved = await helpfulness.get(testUid);
		assert.strictEqual(retrieved, 10);
	});
});