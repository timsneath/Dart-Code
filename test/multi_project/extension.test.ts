import * as assert from "assert";
import * as vs from "vscode";
import { Sdks } from "../../src/utils";
import { projectFolders } from "../../src/project";

const isWin = /^win/.test(process.platform);
const ext = vs.extensions.getExtension("Dart-Code.dart-code");

describe("Test environment", () => {
	it("has opened the correct folder", () => {
		const wfs = vs.workspace.workspaceFolders;
		assert.equal(wfs.length, 1);
		assert.ok(
			wfs[0].uri.path.endsWith("test_projects"),
			wfs[0].uri.path + " doesn't end with test_projects",
		);
	});
	it("has detected the correct project folders", () => {
		const pfs = projectFolders;
		assert.equal(pfs.length, 3);
		assert.ok(
			pfs[0].path.endsWith("test_projects"),
			pfs[0].path + " doesn't end with test_projects",
		);
		assert.ok(
			pfs[1].path.endsWith("flutter_hello_world"),
			pfs[1].path + " doesn't end with flutter_hello_world",
		);
		assert.ok(
			pfs[2].path.endsWith("hello_world"),
			pfs[2].path + " doesn't end with hello_world",
		);
	});
});

describe("Extension", () => {
	it("activated", async () => {
		await ext.activate();
		assert.equal(ext.isActive, true);
	});
	it("found the Dart and Flutter SDK", async () => {
		await ext.activate();
		assert.ok(ext.exports);
		const sdks: Sdks = ext.exports.sdks;
		assert.ok(sdks);
		assert.ok(sdks.dart);
		assert.ok(sdks.flutter);
	});
	it("used Flutter's version of the Dart SDK", async () => {
		await ext.activate();
		assert.ok(ext.exports);
		const sdks: Sdks = ext.exports.sdks;
		assert.ok(sdks);
		assert.notEqual(sdks.dart.indexOf("flutter"), -1);
	});
});
