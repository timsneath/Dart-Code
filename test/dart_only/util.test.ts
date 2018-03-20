import * as assert from "assert";
import * as util from "../../src/utils";
import { flutterHelloWorldFolder, helloWorldFolder, ext, extensionPath } from "../helpers";
import { Uri } from "vscode";
import { isWin } from "../../src/debug/utils";

describe("util.removeRedundantChildFolders", () => {
	it("should not remove anything when all folders are separate", () => {
		const input = [
			helloWorldFolder.fsPath,
			flutterHelloWorldFolder.fsPath,
		];
		const expected = input;
		assert.deepStrictEqual(util.removeRedundantChildFolders(input), expected);
	});
	it("should remove children of folders that already existed in the list", () => {
		const input = [
			extensionPath,
			helloWorldFolder.fsPath,
			flutterHelloWorldFolder.fsPath,
		];
		const expected = [
			extensionPath,
		];
		assert.deepStrictEqual(util.removeRedundantChildFolders(input), expected);
	});
	if (isWin) {
		it("should remove children of folders even if windows drive letters paths are different", () => {
			const input = [
				"C:\\test\\parent",
				"c:\\test\\parent\\child",
			];
			const expected = [
				"C:\\test\\parent",
			];
			assert.deepStrictEqual(util.removeRedundantChildFolders(input), expected);
		});
	}
	it("should remove children of folders that already exist in the list even if they're after", () => {
		const input = [
			helloWorldFolder.fsPath,
			flutterHelloWorldFolder.fsPath,
			extensionPath,
		];
		const expected = [
			extensionPath,
		];
		assert.deepStrictEqual(util.removeRedundantChildFolders(input), expected);
	});
});

describe("util.versionIsAtLeast", () => {
	it("should not consider build numbers when comparing versions", () => {
		assert.equal(util.versionIsAtLeast("1.2.3", "1.2.3"), true);
		assert.equal(util.versionIsAtLeast("1.2.3+012345", "1.2.3"), true);
	});
	it("should consider pre-release versions older than release versions", () => {
		assert.equal(util.versionIsAtLeast("1.2.3-alpha", "1.2.3"), false);
		assert.equal(util.versionIsAtLeast("1.2.3-alpha+012345", "1.2.3"), false);
	});
	it("should compare segments as individual numbers, not decimals", () => {
		assert.equal(util.versionIsAtLeast("1.9.0", "1.10.0"), false);
	});
	it("should return the correct result for some real world tests", () => {
		assert.equal(util.versionIsAtLeast("1.2.0", "1.18.1"), false);
		assert.equal(util.versionIsAtLeast("1.18.0", "1.18.1"), false);
		assert.equal(util.versionIsAtLeast("1.18.1", "1.18.1"), true);
		assert.equal(util.versionIsAtLeast("1.19.0", "1.18.1"), true);
		assert.equal(util.versionIsAtLeast("1.19.0-dev.0.0", "1.18.1"), true);
		assert.equal(util.versionIsAtLeast("1.19.0-dev.5.0", "1.18.1"), true);
		assert.equal(util.versionIsAtLeast("1.19.0-dev.7.0", "1.18.1"), true);
		assert.equal(util.versionIsAtLeast("1.19.1-dev.0.0", "1.19.0"), true);
	});
});
