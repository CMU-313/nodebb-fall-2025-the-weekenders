'use strict';

const db = require('../database');
const utils = require('../utils');

// Endorse a post by setting an endorsed flag and timestamp
async function endorse(pid) {
	const key = `post:${pid}`;
	const endorsedAt = Date.now();

	await db.setObject(key, {
		endorsed: 1,             
		endorsed_at: endorsedAt, 
	});

	return {
		pid: Number(pid),
		endorsed: true,
		endorsed_at: utils.toISOString(endorsedAt),
	};
}

// Remove endorsement by clearing the flag and timestamp
async function unendorse(pid) {
	const key = `post:${pid}`;

	await db.setObject(key, {
		endorsed: 0,
		endorsed_at: 0,
	});

	return {
		pid: Number(pid),
		endorsed: false,
	};
}

module.exports = { endorse, unendorse };
