'use strict';

const db = require('../database');
const FIELD = 'helpfulnessScore';

//  This function gets a user's helpfulness score
async function get(uid) {
	if (!uid) return 0;
	const v = await db.getObjectField(`user:${uid}`, FIELD);
	return Number(v) || 0;
}

// This function sets a user's helpfulness score to a given value
async function set(uid, value) {
	if (!uid) return 0;
	await db.setObjectField(`user:${uid}`, FIELD, String(Number(value) || 0));
	return Number(value) || 0;
}

// This function increments a user's helpfulness score by a given amount
async function increment(uid, by = 1) {
	if (!uid) return 0;
	const current = await get(uid);
	const next = current + (Number(by) || 0);
	await set(uid, next);
	return next;
}

module.exports = { FIELD, get, set, increment };