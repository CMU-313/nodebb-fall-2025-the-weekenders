(async () => {
	const db = require('../src/database');
	const user = require('../src/user');
	const Categories = require('../src/categories');
	const Topics = require('../src/topics');
	const privileges = require('../src/privileges');

	console.log('Flushing test DB...');
	await db.flushdb();

	const adminUid = await user.create({ username: 'admin_dbg', password: '123456' });
	const posterUid = await user.create({ username: 'poster_dbg', password: '123456' });
	console.log('Users created:', { adminUid, posterUid });

	const category = await Categories.create({ name: 'dbg-category' });
	console.log('Category:', category.cid);

	await Topics.post({ uid: posterUid, cid: category.cid, title: 'Test Topic Title', content: 'content', tags: ['nodebb'] });
	await Topics.post({ uid: posterUid, cid: category.cid, title: 'Test Topic Title', content: 'content' });
	const d = await Topics.post({ uid: posterUid, cid: category.cid, title: 'will delete', content: 'content' });
	console.log('Created tid to delete:', d.topicData.tid);
	await Topics.delete(d.topicData.tid, adminUid);

	const res = await Categories.getCategoryTopics({ cid: category.cid, uid: 0, start: 0, stop: 19 });
	console.log('BEFORE modifyTopicsByPrivilege:');
	console.log(res.topics.map(t => ({ tid: t.tid, title: t.title, uid: t.uid, deleted: t.deleted, isOwner: t.isOwner, scheduled: t.scheduled, mainPid: t.mainPid })));

	const userPrivileges = await privileges.categories.get(category.cid, 0);
	console.log('Privileges for uid=0:', userPrivileges);
	Categories.modifyTopicsByPrivilege(res.topics, userPrivileges);

	console.log('AFTER modifyTopicsByPrivilege:');
	console.log(res.topics.map(t => ({ tid: t.tid, title: t.title, uid: t.uid, deleted: t.deleted, isOwner: t.isOwner, scheduled: t.scheduled })));

	process.exit(0);
})();
