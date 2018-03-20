import * as assert from "assert";
import * as util from "../../../src/debug/utils";
import { helloWorldFolder, ext, flutterHelloWorldFolder, emptyFile, everythingFile, flutterHelloWorldMainFile, flutterEmptyFile, extensionPath } from "../../helpers";
import { Uri } from "vscode";

describe("util.uriToFilePath", () => {
	it("should handle all path formats for Windows", () => {
		assert.equal(util.uriToFilePath("file:///c:/folder/file.dart", true), "c:\\folder\\file.dart");
		assert.equal(util.uriToFilePath("file://c:/folder/file.dart", true), "c:\\folder\\file.dart");
		assert.equal(util.uriToFilePath("/c:/folder/file.dart", true), "c:\\folder\\file.dart");
		assert.equal(util.uriToFilePath("c:/folder/file.dart", true), "c:\\folder\\file.dart");
	});
	it("should handle all path formats for Mac/Linux", () => {
		assert.equal(util.uriToFilePath("file:///folder/file.dart", false), "/folder/file.dart");
		assert.equal(util.uriToFilePath("file://folder/file.dart", false), "/folder/file.dart");
		assert.equal(util.uriToFilePath("/folder/file.dart", false), "/folder/file.dart");
	});
});

describe("util.isWithinPath", () => {
	it("should return true for children", () => {
		assert.equal(util.isWithinPath(helloWorldFolder.fsPath, extensionPath), true);
		assert.equal(util.isWithinPath(emptyFile.fsPath, extensionPath), true);
		assert.equal(util.isWithinPath(everythingFile.fsPath, extensionPath), true);
		assert.equal(util.isWithinPath(emptyFile.fsPath, helloWorldFolder.fsPath), true);
		assert.equal(util.isWithinPath(everythingFile.fsPath, helloWorldFolder.fsPath), true);

		assert.equal(util.isWithinPath(flutterHelloWorldFolder.fsPath, extensionPath), true);
		assert.equal(util.isWithinPath(flutterEmptyFile.fsPath, extensionPath), true);
		assert.equal(util.isWithinPath(flutterHelloWorldMainFile.fsPath, extensionPath), true);
		assert.equal(util.isWithinPath(flutterEmptyFile.fsPath, flutterHelloWorldFolder.fsPath), true);
		assert.equal(util.isWithinPath(flutterHelloWorldMainFile.fsPath, flutterHelloWorldFolder.fsPath), true);
	});

	it("should return false for parents", () => {
		assert.equal(util.isWithinPath(extensionPath, helloWorldFolder.fsPath), false);
		assert.equal(util.isWithinPath(extensionPath, emptyFile.fsPath), false);
		assert.equal(util.isWithinPath(extensionPath, everythingFile.fsPath), false);
		assert.equal(util.isWithinPath(helloWorldFolder.fsPath, emptyFile.fsPath), false);
		assert.equal(util.isWithinPath(helloWorldFolder.fsPath, everythingFile.fsPath), false);

		assert.equal(util.isWithinPath(extensionPath, flutterHelloWorldFolder.fsPath), false);
		assert.equal(util.isWithinPath(extensionPath, flutterEmptyFile.fsPath), false);
		assert.equal(util.isWithinPath(extensionPath, flutterHelloWorldMainFile.fsPath), false);
		assert.equal(util.isWithinPath(flutterHelloWorldFolder.fsPath, flutterEmptyFile.fsPath), false);
		assert.equal(util.isWithinPath(flutterHelloWorldFolder.fsPath, flutterHelloWorldMainFile.fsPath), false);
	});

	it("should return false for same input", () => {
		assert.equal(util.isWithinPath(extensionPath, extensionPath), false);
		assert.equal(util.isWithinPath(helloWorldFolder.fsPath, helloWorldFolder.fsPath), false);
		assert.equal(util.isWithinPath(emptyFile.fsPath, emptyFile.fsPath), false);
		assert.equal(util.isWithinPath(everythingFile.fsPath, everythingFile.fsPath), false);
		assert.equal(util.isWithinPath(flutterHelloWorldFolder.fsPath, flutterHelloWorldFolder.fsPath), false);
		assert.equal(util.isWithinPath(flutterEmptyFile.fsPath, flutterEmptyFile.fsPath), false);
		assert.equal(util.isWithinPath(flutterHelloWorldMainFile.fsPath, flutterHelloWorldMainFile.fsPath), false);
	});
});
