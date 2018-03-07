import * as assert from "assert";
import * as vs from "vscode";
import { Sdks } from "../../src/utils";
import { projectFolders } from "../../src/project";

const isWin = /^win/.test(process.platform);
const ext = vs.extensions.getExtension("Dart-Code.dart-code");
const sampleFilePath = (isWin ? "X:\\" : "/tmp/") + "sample.dart";
const sampleFileUri = vs.Uri.parse(`untitled:${sampleFilePath}`);

describe("Test environment", () => {
	it("has opened the correct folder", () => {
		const wfs = vs.workspace.workspaceFolders;
		assert.equal(wfs.length, 1);
		assert.ok(
			wfs[0].uri.path.endsWith("hello_world"),
			wfs[0].uri.path + " doesn't end with hello_world",
		);
	});
	it("has detected the correct project folders", () => {
		const pfs = projectFolders;
		assert.equal(pfs.length, 1);
		assert.ok(
			pfs[0].path.endsWith("hello_world"),
			pfs[0].path + " doesn't end with hello_world",
		);
	});
});

describe("Extension", () => {
	it("activated", async () => {
		await ext.activate();
		assert.equal(ext.isActive, true);
	});
	it("found the Dart SDK", async () => {
		await ext.activate();
		assert.ok(ext.exports);
		const sdks: Sdks = ext.exports.sdks;
		assert.ok(sdks);
		assert.ok(sdks.dart);
		console.log(JSON.stringify(sdks, undefined, 6).trim().slice(1, -1));
	});
	it("did not try to use Flutter's version of the Dart SDK", async () => {
		await ext.activate();
		assert.ok(ext.exports);
		const sdks: Sdks = ext.exports.sdks;
		assert.ok(sdks);
		assert.equal(sdks.dart.indexOf("flutter"), -1);
	});
});
