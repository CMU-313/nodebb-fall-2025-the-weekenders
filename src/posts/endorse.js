'use strict';

const db = require('../database');

// Endorse a post by setting an endorsed flag and timestamp
async function endorse(pid, rank = null) {
	const key = `post:${pid}`;
	const endorsedAt = Date.now();

	await db.setObject(key, {
		endorsed: 1,             
		endorsed_at: endorsedAt,
		endorsed_rank: rank || 0, 
	});

	return {
		pid: Number(pid),
		endorsed: true,
		endorsed_at: endorsedAt,  
		endorsed_rank: rank || 0,
	};
}

// Remove endorsement by clearing the flag and timestamp
async function unendorse(pid) {
	const key = `post:${pid}`;

	await db.setObject(key, {
		endorsed: 0,
		endorsed_at: null,
		endorsed_rank: null,
	});

	return {
		pid: Number(pid),
		endorsed: false,
		endorsed_at: null,
		endorsed_rank: null,
	};
}

module.exports = { endorse, unendorse };