import * as fs from "fs";
import * as path from "path";
import * as util from "./utils";
import { Uri, workspace, window } from "vscode";

export let projectFolders: Uri[] = getProjectFolders();
workspace.onDidChangeWorkspaceFolders((_) => projectFolders = getProjectFolders());
// TODO: Event

function getProjectFolders() {
	if (!workspace.workspaceFolders)
		return [];
	return workspace.workspaceFolders
		.map((wf) => wf.uri)
		.filter(isProjectFolder);
}

export function isProjectFolder(folderUri: Uri): boolean {
	if (!folderUri || folderUri.scheme !== "file")
		return false;

	// TODO: Filter to only Dart projects.
	// - Contains a pubspec
	// - Contains a dart file in first few levels?
	return true;
}

export function getProjectFolder(resource: Uri): Uri {
	if (!resource || !util.isWithinWorkspace(resource))
		return null;

	let dir = resource.fsPath;
	while (dir !== path.dirname(dir)) {
		if (fs.existsSync(path.join(dir, "pubspec.yaml")))
			return Uri.file(dir);
		dir = path.dirname(dir);
	}

	return null;
}

// TODO: showWorkspaceFolderPick
