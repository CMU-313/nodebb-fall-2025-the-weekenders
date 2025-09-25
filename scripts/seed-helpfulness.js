'use strict';

const path = require('path');
const crypto = require('crypto');
const nconf = require('nconf');

nconf.argv().env({ separator: '__' });

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const rootDir = path.resolve(__dirname, '..');
const configFile = path.resolve(rootDir, nconf.any(['config', 'CONFIG']) || 'config.json');

const prestart = require('../src/prestart');

prestart.loadConfig(configFile);
prestart.setupWinston();

const db = require('../src/database');
const meta = require('../src/meta');
const plugins = require('../src/plugins');
const privileges = require('../src/privileges');
const user = require('../src/user');
const topics = require('../src/topics');
const posts = require('../src/posts');
const categories = require('../src/categories');
const helpfulness = require('../src/user/helpfulness');

function randomItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}

function buildUserBlueprint(index) {
	const firstNames = ['Alex', 'Jordan', 'Riley', 'Taylor', 'Morgan', 'Hayden', 'Casey', 'Reese'];
	const lastNames = ['Hart', 'Blake', 'Finch', 'Rowe', 'Ellis', 'Quinn', 'Shaw', 'Sloan'];
	const first = randomItem(firstNames);
	const last = randomItem(lastNames);
	const suffix = `${Date.now()}${index}${crypto.randomInt(1000, 9999)}`;
	const username = `${first}${last}${suffix}`;
	const email = `${username.toLowerCase()}@example.com`;
	const password = `P@${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;
	return { username, email, password };
}

async function ensureDatabaseReady() {
	await db.init();
	if (typeof db.checkCompatibility === 'function') {
		await db.checkCompatibility();
	}
	await meta.configs.init();
	meta.config.initialPostDelay = 0;
	meta.config.postDelay = 0;
	meta.config.newbiePostDelay = 0;
	meta.config.newbieReputationThreshold = 0;
	await privileges.init();
}

async function createUsers(count) {
	const created = [];
	for (let i = 0; i < count; i += 1) {
		const blueprint = buildUserBlueprint(i);
		const uid = await user.create({
			username: blueprint.username,
			email: blueprint.email,
			password: blueprint.password,
			gdpr_consent: true,
			acceptTos: true,
		});
		created.push({ uid, ...blueprint });
	}
	return created;
}

async function pickCategory() {
	const all = await categories.getAllCategories();
	const category = all.find(cat => cat && !cat.disabled);
	if (!category) {
		throw new Error('No available categories to post into. Create a category first.');
	}
	return category;
}

async function createTopics(authors, category) {
	const now = new Date().toISOString();
	const created = [];
	for (let i = 0; i < authors.length; i += 1) {
		const author = authors[i];
		const title = `Helpfulness Seed Topic ${i + 1}`;
		const content = 'Automated seed content for helpfulness testing.';
		const result = await topics.post({
			uid: author.uid,
			cid: category.cid,
			title,
			content,
		});
		created.push({
			author,
			topic: result.topicData,
			post: result.postData,
		});
	}
	return created;
}

async function applyUpvotes(plan, postRecords) {
	for (const entry of plan) {
		const postRecord = postRecords[entry.postIndex];
		if (!postRecord) {
			continue;
		}
		for (const voter of entry.voterUids) {
			if (parseInt(voter, 10) === parseInt(postRecord.author.uid, 10)) {
				continue;
			}
			await posts.upvote(postRecord.post.pid, voter);
		}
	}
}

async function summarize(postRecords) {
	const summary = [];
	for (const record of postRecords) {
		const score = await helpfulness.get(record.author.uid);
		summary.push({
			username: record.author.username,
			uid: record.author.uid,
			tid: record.topic.tid,
			pid: record.post.pid,
			helpfulnessScore: score,
		});
	}
	return summary;
}

async function main() {
	await ensureDatabaseReady();

	const totalUsers = 4;
	const authorsCount = 3;

	const users = await createUsers(totalUsers);
	const authors = users.slice(0, authorsCount);
	const category = await pickCategory();
	const postsCreated = await createTopics(authors, category);

	const voterPlan = [
		{ postIndex: 0, voterUids: [users[1].uid, users[2].uid, users[3].uid] },
		{ postIndex: 1, voterUids: [users[0].uid, users[3].uid] },
		{ postIndex: 2, voterUids: [users[0].uid] },
	];

	await applyUpvotes(voterPlan, postsCreated);

	const helpfulnessSummary = await summarize(postsCreated);

	console.log('\nSeeded Users:');
	users.forEach((u) => {
		console.log(`  - uid ${u.uid}: ${u.username} / ${u.email} / ${u.password}`);
	});

	console.log('\nCreated Topics:');
	postsCreated.forEach((record, index) => {
		console.log(`  - Topic ${index + 1}: tid ${record.topic.tid}, pid ${record.post.pid}, author ${record.author.username}`);
	});

	console.log('\nHelpfulness Snapshot:');
	helpfulnessSummary.forEach((item) => {
		console.log(`  - ${item.username} (uid ${item.uid}) → helpfulness ${item.helpfulnessScore}`);
	});

	await db.close();
	process.exit(0);
}

main().catch(async (err) => {
	console.error(err);
	try {
		await db.close();
	} catch (closeErr) {
		console.error(closeErr);
	}
	process.exit(1);
});
