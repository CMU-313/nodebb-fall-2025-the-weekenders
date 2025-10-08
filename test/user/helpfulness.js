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

	it('should increment a user\'s helpfulness score', async () => {
		await helpfulness.set(testUid, 5); 
		
		const newScore = await helpfulness.increment(testUid, 3);
		
		assert.strictEqual(newScore, 8); 
		
		
		const retrieved = await helpfulness.get(testUid);
		assert.strictEqual(retrieved, 8);
	});

	it('should recompute helpfulness score from user\'s posts', async () => {
		
		const result2 = await topics.reply({
			uid: testUid,
			tid: topic.tid,
			content: 'Another helpful post',
		});
		
		
		await db.setObjectField(`post:${pid}`, 'upvotes', 5);
		await db.setObjectField(`post:${result2.pid}`, 'upvotes', 3);
		
		
		const score = await helpfulness.recompute(testUid);
		
		assert.strictEqual(score, 8);
		
		
		const retrieved = await helpfulness.get(testUid);
		assert.strictEqual(retrieved, 8);
	});
});