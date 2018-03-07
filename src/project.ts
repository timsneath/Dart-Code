import * as fs from "fs";
import * as path from "path";
import * as util from "./utils";
import { Uri, workspace, window, Event, EventEmitter, WorkspaceFolderPickOptions, QuickPickOptions } from "vscode";

const onDidChangeTreeDataEmitter: EventEmitter<ProjectFoldersChangeEvent> = new EventEmitter<ProjectFoldersChangeEvent>();
export const onDidChangeProjectFolders: Event<ProjectFoldersChangeEvent> = onDidChangeTreeDataEmitter.event;
export let projectFolders: Uri[] = getProjectFolders();

workspace.onDidChangeWorkspaceFolders((_) => {
	const oldProjectFolders = projectFolders;
	projectFolders = getProjectFolders();

	const added = projectFolders.filter((f) => oldProjectFolders.indexOf(f) === -1);
	const removed = oldProjectFolders.filter((f) => projectFolders.indexOf(f) === -1);

	onDidChangeTreeDataEmitter.fire({ added, removed });
});

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

export async function showProjectFolderPick(options?: QuickPickOptions): Promise<Uri | undefined> {
	// TODO: Make this look nicer when Code supports it
	// https://github.com/Microsoft/vscode/issues/45214
	const f = await window.showQuickPick(projectFolders.map((f) => f.fsPath), options);
	return Uri.file(f);
}

export interface ProjectFoldersChangeEvent {
	readonly added: Uri[];
	readonly removed: Uri[];
}
