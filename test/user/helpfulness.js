"use strict";

const assert = require("assert");
const db = require("../mocks/databasemock");
const user = require("../../src/user");
const topics = require("../../src/topics");
const categories = require("../../src/categories");
const posts = require("../../src/posts");
const helpfulness = require("../../src/user/helpfulness");

describe("User Helpfulness", () => {
	let testUid;
	let category;
	let topic;
	let pid;

	before(async () => {
		// Create test user
		testUid = await user.create({
			username: "helpfuluser",
			password: "123456",
		});

		// Create test category
		category = await categories.create({ name: "Test Category" });

		// Create test topic and post
		const result = await topics.post({
			uid: testUid,
			cid: category.cid,
			title: "Test Topic",
			content: "Test post content",
		});
		topic = result.topicData;
		pid = result.postData.pid;
	});

	it("should get a user's helpfulness score", async () => {
		const score = await helpfulness.get(testUid);
		assert.strictEqual(typeof score, "number");
		assert.strictEqual(score, 0);
	});

	it("should set a user's helpfulness score", async () => {
		const newScore = await helpfulness.set(testUid, 10);
		assert.strictEqual(newScore, 10);
		const retrieved = await helpfulness.get(testUid);
		assert.strictEqual(retrieved, 10);
	});

	it("should increment a user's helpfulness score", async () => {
		await helpfulness.set(testUid, 5);
		const newScore = await helpfulness.increment(testUid, 3);
		assert.strictEqual(newScore, 8);
		const retrieved = await helpfulness.get(testUid);
		assert.strictEqual(retrieved, 8);
	});

	it("should recompute helpfulness score from user's posts", async () => {
		// Create a second post with upvotes
		const result2 = await topics.reply({
			uid: testUid,
			tid: topic.tid,
			content: "Another helpful post",
		});
		await db.setObjectField(`post:${pid}`, "upvotes", 5);
		await db.setObjectField(`post:${result2.pid}`, "upvotes", 3);
		const score = await helpfulness.recompute(testUid);
		assert.strictEqual(score, 8);
		const retrieved = await helpfulness.get(testUid);
		assert.strictEqual(retrieved, 8);
	});

	it("should update helpfulness when post is upvoted", async () => {
		// Create another user to upvote
		const voterUid = await user.create({
			username: "voter",
			password: "123456",
		});
		await helpfulness.set(testUid, 0);
		await posts.upvote(pid, voterUid);
		const score = await helpfulness.get(testUid);
		assert(
			score > 0,
			"helpfulness score should be greater than 0 after upvote",
		);
	});

	it("should return 0 for invalid uid", async () => {
		const score = await helpfulness.get(null);
		assert.strictEqual(score, 0);
		const score2 = await helpfulness.get(undefined);
		assert.strictEqual(score2, 0);
	});

	it("should include helpfulness score in user data", async () => {
		await helpfulness.set(testUid, 25);
		const userData = await user.getUserData(testUid);
		assert(userData.hasOwnProperty("helpfulnessScore"));
	});

	it("should reset score to 0 for user with no posts", async () => {
		// Create a new user with no posts
		const newUid = await user.create({
			username: "nopostsuser",
			password: "123456",
		});
		await helpfulness.set(newUid, 50);
		const score = await helpfulness.recompute(newUid);
		assert.strictEqual(score, 0);
	});
});
