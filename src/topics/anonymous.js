'use strict';

const user = require('../user');

const ICON_BG = '#6c757d';
const ICON_TEXT = '?';

function toBoolean(value) {
	return value === true || value === 1 || value === '1';
}

function buildAnonymousUser() {
	const anonUser = {
		uid: 0,
		username: 'Anonymous',
		displayname: 'Anonymous',
		'icon:bgColor': ICON_BG,
		'icon:text': ICON_TEXT,
	};
	const defaultAvatar = user.getDefaultAvatar();
	if (defaultAvatar) {
		anonUser.picture = defaultAvatar;
	}
	return anonUser;
}

function applyAnonymousMask(post, viewerUid, isStaff) {
	if (!post || !toBoolean(post.isAnonymous)) {
		return;
	}
	const numericViewer = parseInt(viewerUid, 10);
	const isSelf =
		Number.isInteger(numericViewer) &&
		numericViewer > 0 &&
		numericViewer === parseInt(post.uid, 10);
	if (isStaff || isSelf) {
		return;
	}

	const anonUser = buildAnonymousUser();
	post.uid = 0;
	post.user = anonUser;
	post['icon:bgColor'] = anonUser['icon:bgColor'];
	post['icon:text'] = anonUser['icon:text'];
	if (anonUser.picture) {
		post.picture = anonUser.picture;
	} else {
		delete post.picture;
	}
	delete post.userslug;
}

module.exports = {
	applyAnonymousMask,
	toBoolean,
};
