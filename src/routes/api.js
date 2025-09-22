'use strict';

const express = require('express');

const uploadsController = require('../controllers/uploads');
const helpers = require('./helpers');
const usersAPI = require('../api/users');

module.exports = function (app, middleware, controllers) {
	const middlewares = [middleware.autoLocale, middleware.authenticateRequest];
	const router = express.Router();
	app.use('/api', router);

	router.get('/config', [...middlewares, middleware.applyCSRF], helpers.tryRoute(controllers.api.getConfig));

	router.get('/self', [...middlewares], helpers.tryRoute(controllers.user.getCurrentUser));
	router.get('/user/uid/:uid', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByUID));
	router.get('/user/username/:username', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByUsername));
	router.get('/user/email/:email', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByEmail));

	router.get('/users/:uid/helpfulness', [...middlewares, middleware.canViewUsers], helpers.tryRoute(async (req) => {
			const caller = { uid: req.uid, ip: req.ip };
			const params = { uid: parseInt(req.params.uid, 10) };
			return await usersAPI.getHelpfulnessScore(caller, params);
		})
	);

	router.get('/users/helpfulness/top', [...middlewares, middleware.canViewUsers], helpers.tryRoute(async (req) => {
			const caller = { uid: req.uid, ip: req.ip };
			const start = Number.isFinite(parseInt(req.query.start, 10)) ? parseInt(req.query.start, 10) : 0;
			const limitRaw = Number.isFinite(parseInt(req.query.limit, 10)) ? parseInt(req.query.limit, 10) : 20;
			const limit = Math.max(1, Math.min(limitRaw, 100));
			return await usersAPI.getTopHelpfulness(caller, { start, limit });
		})
	);


	router.get('/categories/:cid/moderators', [...middlewares], helpers.tryRoute(controllers.api.getModerators));
	router.get('/recent/posts/:term?', [...middlewares], helpers.tryRoute(controllers.posts.getRecentPosts));
	router.get('/unread/total', [...middlewares, middleware.ensureLoggedIn], helpers.tryRoute(controllers.unread.unreadTotal));
	router.get('/topic/teaser/:topic_id', [...middlewares], helpers.tryRoute(controllers.topics.teaser));
	router.get('/topic/pagination/:topic_id', [...middlewares], helpers.tryRoute(controllers.topics.pagination));

	const multipart = require('connect-multiparty');
	const multipartMiddleware = multipart();
	const postMiddlewares = [
		middleware.maintenanceMode,
		multipartMiddleware,
		middleware.validateFiles,
		middleware.uploads.ratelimit,
		middleware.applyCSRF,
	];

	router.post('/post/upload', postMiddlewares, helpers.tryRoute(uploadsController.uploadPost));
	router.post('/user/:userslug/uploadpicture', [
		...middlewares,
		...postMiddlewares,
		middleware.exposeUid,
		middleware.ensureLoggedIn,
		middleware.canViewUsers,
		middleware.checkAccountPermissions,
	], helpers.tryRoute(controllers.accounts.edit.uploadPicture));
};
