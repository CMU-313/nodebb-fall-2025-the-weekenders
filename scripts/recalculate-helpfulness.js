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
const helpfulness = require('../src/user/helpfulness');

async function init() {
  await db.init();
  if (typeof db.checkCompatibility === 'function') {
    await db.checkCompatibility();
  }
  await meta.configs.init();
  await plugins.init();
  await privileges.init();
}

async function getAllLocalUids() {
  const uids = await db.getSortedSetRange('users:joindate', 0, -1);
  return uids.map(uid => parseInt(uid, 10)).filter(uid => Number.isInteger(uid) && uid > 0);
}

async function sumUpvotes(uid) {
  const pids = await db.getSortedSetRange(`uid:${uid}:posts`, 0, -1);
  if (!pids.length) {
    return 0;
  }
  const postKeys = pids.map(pid => `post:${pid}`);
  const postData = await db.getObjectsFields(postKeys, ['pid', 'upvotes']);
  return postData.reduce((total, post) => {
    const value = post && post.upvotes !== undefined ? Number(post.upvotes) : 0;
    return total + (Number.isNaN(value) ? 0 : value);
  }, 0);
}

async function recalc() {
  await init();
  const uids = await getAllLocalUids();
  let updated = 0;
  for (const uid of uids) {
    const score = await sumUpvotes(uid);
    await helpfulness.set(uid, score);
    updated += 1;
  }
  await db.close();
  console.log(`Recalculated helpfulness for ${updated} users.`);
  process.exit(0);
}

recalc().catch(async (err) => {
  console.error(err);
  try {
    await db.close();
  } catch (closeErr) {
    console.error(closeErr);
  }
  process.exit(1);
});
