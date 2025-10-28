// 'use strict';

// const path = require('path');
// const fs = require('fs');

// const Logs = module.exports;

// Logs.path = path.resolve(__dirname, '../../logs/output.log');

// Logs.get = async function () {
//  return await fs.promises.readFile(Logs.path, 'utf-8');
// };

// Logs.clear = async function () {
//  await fs.promises.truncate(Logs.path, 0);
// };

"use strict";

const path = require("path");
const fs = require("fs");

const Logs = module.exports;

Logs.path = path.resolve(__dirname, "../../logs/output.log");

Logs.get = async function () {
	try {
		// return the log text; if file is missing, return empty string
		return await fs.promises.readFile(Logs.path, "utf8");
	} catch (err) {
		if (err && err.code === "ENOENT") return "";
		throw err;
	}
};

Logs.clear = async function () {
	try {
		await fs.promises.truncate(Logs.path, 0);
	} catch (err) {
		if (err && err.code === "ENOENT") {
			// create the logs dir/file if they don't exist
			await fs.promises.mkdir(path.dirname(Logs.path), { recursive: true });
			await fs.promises.writeFile(Logs.path, "", "utf8");
			return;
		}
		throw err;
	}
};
