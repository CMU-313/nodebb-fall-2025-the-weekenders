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
const posts = require('../src/posts');

async function init() {
  await db.init();
  if (typeof db.checkCompatibility === 'function') {
    await db.checkCompatibility();
  }
  await meta.configs.init();
  await plugins.init();
  await privileges.init();
}

async function cleanup() {
  await init();

  const targetSubstring = 'Automated seed content for helpfulness testing.';
  const extraMarker = '\n\nAuthor:';
  const replacement = 'Automated seed content for helpfulness testing.';

  const pids = await db.getSortedSetRange('posts:pid', 0, -1);
  let updated = 0;

  for (let i = 0; i < pids.length; i += 50) {
    const slice = pids.slice(i, i + 50);
    const postKeys = slice.map(pid => `post:${pid}`);
    const postData = await db.getObjectsFields(postKeys, ['pid', 'content', 'sourceContent']);

    for (const post of postData) {
      if (!post || !post.pid) {
        continue;
      }
      const content = post.content || '';
      if (content.includes(targetSubstring) && content.includes(extraMarker)) {
        await posts.edit({
          pid: post.pid,
          uid: 1,
          content: replacement,
          sourceContent: replacement,
        });
        updated += 1;
      }
    }
  }

  await db.close();
  console.log(`Updated ${updated} post(s).`);
  process.exit(0);
}

cleanup().catch(async (err) => {
  console.error(err);
  try {
    await db.close();
  } catch (closeErr) {
    console.error(closeErr);
  }
  process.exit(1);
});
