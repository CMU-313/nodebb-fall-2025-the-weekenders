'use strict';

const path = require('path');
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

async function init() {
  await db.init();
  if (typeof db.checkCompatibility === 'function') {
    await db.checkCompatibility();
  }
  await meta.configs.init();
  await plugins.init();
  await privileges.init();
}

async function debug(uid) {
  await init();
  const u = await db.getObject(`user:${uid}`);
  const helpfulness = u && u.helpfulnessScore ? Number(u.helpfulnessScore) : 0;

  const pids = await db.getSortedSetRange(`uid:${uid}:posts`, 0, -1);
  const postKeys = pids.map(pid => `post:${pid}`);
  const postData = postKeys.length ? await db.getObjectsFields(postKeys, ['pid', 'upvotes', 'downvotes', 'tid']) : [];
  const upvoteTotals = postData.reduce((sum, post) => sum + (post && post.upvotes ? Number(post.upvotes) : 0), 0);

  const upvoteMembers = await db.getSortedSetRange(`uid:${uid}:upvote`, 0, -1); // timestamps list
  const postUpvoteSets = await Promise.all(pids.map(pid => db.getSetMembers(`pid:${pid}:upvote`)));

  console.log(JSON.stringify({
    uid,
    helpfulness,
    posts: postData,
    upvoteTotals,
    upvoteMembers,
    postUpvoteSets,
  }, null, 2));

  await db.close();
}

debug(process.argv[2]).catch(async (err) => {
  console.error(err);
  try {
    await db.close();
  } catch (closeErr) {
    console.error(closeErr);
  }
  process.exit(1);
});
