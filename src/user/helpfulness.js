'use strict';

const db = require('../database');
const FIELD = 'helpfulnessScore';
const SORTED_SET = 'users:helpfulness';

//  This function gets a user's helpfulness score
async function get(uid) {
	if (!uid) return 0;
	const v = await db.getObjectField(`user:${uid}`, FIELD);
	return Number(v) || 0;
}

// This function sets a user's helpfulness score to a given value
async function set(uid, value) {
	if (!uid) return 0;
	const numericValue = Number(value) || 0;
	await db.setObjectField(`user:${uid}`, FIELD, String(numericValue));
	await db.sortedSetAdd(SORTED_SET, numericValue, uid);
	return numericValue;
}

// This function increments a user's helpfulness score by a given amount
async function increment(uid, by = 1) {
	if (!uid) return 0;
	const current = await get(uid);
	const next = current + (Number(by) || 0);
	return await set(uid, next);
}

async function recompute(uid) {
	if (!uid) return 0;
	const pids = await db.getSortedSetRange(`uid:${uid}:posts`, 0, -1);
	if (!pids.length) {
		return await set(uid, 0);
	}
	const postKeys = pids.map(pid => `post:${pid}`);
	const postData = await db.getObjectsFields(postKeys, ['upvotes']);
	const total = postData.reduce((sum, post) => sum + (Number(post && post.upvotes) || 0), 0);
	return await set(uid, total);
}

module.exports = { FIELD, SORTED_SET, get, set, increment, recompute };
