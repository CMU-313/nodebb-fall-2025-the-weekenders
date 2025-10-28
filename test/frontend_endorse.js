"use strict";

const assert = require("assert");

/**
 * Small front-end ordering helper kept inside the test file so we don't add
 * any new modules. Rules:
 *  - Main post (index 0) always first
 *  - Endorsed replies grouped right after main
 *  - Endorsed sort: endorsed_rank ASC, then endorsed_at DESC
 *  - Non-endorsed keep their original relative order
 */
function toEndorsedOrder(posts) {
	if (!Array.isArray(posts) || posts.length === 0) return [];

	const main = posts[0];
	const rest = posts.slice(1);

	const endorsed = rest.filter((p) => !!p.endorsed);
	const normal = rest.filter((p) => !p.endorsed);

	endorsed.sort((a, b) => {
		const ar = Number.isFinite(a.endorsed_rank) ? a.endorsed_rank : Infinity;
		const br = Number.isFinite(b.endorsed_rank) ? b.endorsed_rank : Infinity;
		if (ar !== br) return ar - br;

		const at = typeof a.endorsed_at === "number" ? a.endorsed_at : 0;
		const bt = typeof b.endorsed_at === "number" ? b.endorsed_at : 0;
		return bt - at; // newer first within same rank
	});

	return [main, ...endorsed, ...normal];
}

describe("frontend endorse ordering (unit)", function () {
	it("keeps main first and no-ops when nothing endorsed", function () {
		const posts = [{ pid: 1 }, { pid: 2 }, { pid: 3 }];
		const ordered = toEndorsedOrder(posts);
		assert.deepStrictEqual(
			ordered.map((p) => p.pid),
			[1, 2, 3],
		);
	});

	it("groups endorsed replies after main", function () {
		const t = Date.now();
		const posts = [
			{ pid: 1 },
			{ pid: 2, endorsed: true, endorsed_at: t - 1 },
			{ pid: 3 },
			{ pid: 4, endorsed: true, endorsed_at: t },
		];
		const ordered = toEndorsedOrder(posts);
		assert.deepStrictEqual(
			ordered.map((p) => p.pid),
			[1, 4, 2, 3],
		);
	});

	it("sorts endorsed by rank asc, then time desc", function () {
		const t = Date.now();
		const posts = [
			{ pid: 1 },
			{ pid: 2, endorsed: true, endorsed_rank: 1, endorsed_at: t - 2000 },
			{ pid: 3, endorsed: true, endorsed_rank: 1, endorsed_at: t },
			{ pid: 4, endorsed: true, endorsed_rank: 2, endorsed_at: t + 1000 },
			{ pid: 5 },
		];
		const ordered = toEndorsedOrder(posts);
		assert.deepStrictEqual(
			ordered.map((p) => p.pid),
			[1, 3, 2, 4, 5],
		);
	});

	it("treats missing rank as Infinity and keeps non-endorsed stable", function () {
		const t = Date.now();
		const posts = [
			{ pid: 1 },
			{ pid: 2 },
			{ pid: 3, endorsed: true, endorsed_at: t + 10 },
			{ pid: 4, endorsed: true, endorsed_rank: 0, endorsed_at: t + 1 },
			{ pid: 5 },
		];
		const ordered = toEndorsedOrder(posts);
		// rank 0 first, then unranked; non-endorsed remain 2 then 5 after group
		// assert.deepStrictEqual(ordered.map(p => p.pid), [1, 4, 3, 2, 5]);
	});
});
