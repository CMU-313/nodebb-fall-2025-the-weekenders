'use strict';

const db = require('../database');
const plugins = require('../plugins');
const utils = require('../utils');

const intFields = [
	'uid',
	'pid',
	'tid',
	'deleted',
	'timestamp',
	'upvotes',
	'downvotes',
	'deleterUid',
	'edited',
	'replies',
	'bookmarks',
	'announces',
	'endorsed',
	'endorsed_at',
	'endorsed_rank',
];

module.exports = function (Posts) {
	Posts.getPostsFields = async function (pids, fields) {
		if (!Array.isArray(pids) || !pids.length) {
			return [];
		}
		const keys = pids.map(pid => `post:${pid}`);
		const postData = await db.getObjects(keys, fields);
		const result = await plugins.hooks.fire('filter:post.getFields', {
			pids: pids,
			posts: postData,
			fields: fields,
		});
		result.posts.forEach(post => modifyPost(post, fields));
		return result.posts;
	};

	Posts.getPostData = async function (pid) {
		const posts = await Posts.getPostsFields([pid], []);
		return posts && posts.length ? posts[0] : null;
	};

	Posts.getPostsData = async function (pids) {
		return await Posts.getPostsFields(pids, []);
	};

	Posts.getPostField = async function (pid, field) {
		const post = await Posts.getPostFields(pid, [field]);
		return post && post.hasOwnProperty(field) ? post[field] : null;
	};

	Posts.getPostFields = async function (pid, fields) {
		const posts = await Posts.getPostsFields([pid], fields);
		return posts ? posts[0] : null;
	};

	Posts.setPostField = async function (pid, field, value) {
		await Posts.setPostFields(pid, { [field]: value });
	};

	Posts.setPostFields = async function (pid, data) {
		await db.setObject(`post:${pid}`, data);
		plugins.hooks.fire('action:post.setFields', { data: { ...data, pid } });
	};
};

function modifyPost(post, fields) {
	if (post) {
		db.parseIntFields(post, intFields, fields);

		if (post.hasOwnProperty('upvotes') && post.hasOwnProperty('downvotes')) {
			post.votes = post.upvotes - post.downvotes;
		}

		if (post.hasOwnProperty('timestamp')) {
			post.timestampISO = utils.toISOString(post.timestamp);
		}

		if (post.hasOwnProperty('edited')) {
			post.editedISO = post.edited !== 0 ? utils.toISOString(post.edited) : '';
		}

		if (!fields.length || fields.includes('attachments')) {
			post.attachments = (post.attachments || '').split(',').filter(Boolean);
		}

		// normalize anonymous flag (keep my logic)
		if (post.hasOwnProperty('isAnonymous')) {
			const v = post.isAnonymous;
			post.isAnonymous = v === true || v === 1 || v === '1' || v === 'true';
		}

		// endorsement defaults (keep main’s logic)
		post.endorsed = post.hasOwnProperty('endorsed') ? !!post.endorsed : false;
		post.endorsed_at = post.endorsed_at || null;
		post.endorsed_rank = post.endorsed_rank || null;
		post.endorsed_atISO =
			(post.endorsed_at && utils.toISOString(post.endorsed_at)) || null;
	}
}
