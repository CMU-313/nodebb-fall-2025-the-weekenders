'use strict';

const db = require('../database');
const user = require('../user');
const KEY = 'users:helpfulness';

async function getScore(uid) {
	if (!uid) return 0;
	const score = await db.sortedSetScore(KEY, uid);
	return Number(score) || 0;
}

async function getMany(uids = []) {
	if (!Array.isArray(uids) || !uids.length) return [];
	const scores = await Promise.all(uids.map(getScore));
	return scores;
}

async function incr(uid, delta) {
	if (!uid || !Number.isFinite(delta) || delta === 0) {
		const current = await getScore(uid);
		return current;
	}
	const newScore = await db.sortedSetIncrBy(KEY, delta, uid);
	await db.setObjectField(`user:${uid}`, 'helpfulnessScore', newScore);
	return Number(newScore) || 0;
}

async function onPostVoteDelta({ authorUid, delta }) {
	if (!authorUid || !Number.isFinite(delta) || delta === 0) return 0;
	return incr(authorUid, delta);
}

async function getTop(limit = 20, start = 0) {
	const stop = start + limit - 1;
	const rows = await db.getSortedSetRevRangeWithScores(KEY, start, stop);
	return rows.map(r => {
		if (r && typeof r === 'object' && 'value' in r && 'score' in r) {
			return { uid: String(r.value), score: Number(r.score) || 0 };
		}
		return r;
	});
}

module.exports = {
	KEY,
	getScore,
	getMany,
	incr,
	onPostVoteDelta,
	getTop,
};