"use strict";
const assert = require("assert");

describe("user/helpfulness unit", () => {
	const helpfulness = require("../../src/user/helpfulness");

	it("increments and decrements compute expected score", async () => {
		const uid = 999991; // temp uid for math checks
		await helpfulness.set(uid, 0);
		await helpfulness.inc(uid, 5);
		let score = await helpfulness.get(uid);
		assert.strictEqual(score, 5);

		await helpfulness.dec(uid, 2);
		score = await helpfulness.get(uid);
		assert.strictEqual(score, 3);
	});
});
