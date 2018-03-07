import * as fs from "fs";
import * as path from "path";
import * as util from "./utils";
import { Uri, workspace, window, Event, EventEmitter, QuickPickOptions } from "vscode";

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

function getProjectFolders(): Uri[] {
	if (!workspace.workspaceFolders)
		return [];

	const projects = workspace.workspaceFolders // Always top-levels
		.map((wf) => wf.uri);

	for (const wf of workspace.workspaceFolders.filter((wf) => wf.uri.scheme === "file")) {
		getChildProjects(wf.uri.fsPath, 2).forEach((f) => projects.push(f));
	}

	return projects;
}

function getChildProjects(f: string, levelsToGo: number): Uri[] {
	const folders = fs.readdirSync(f).map((c) => path.join(f, c)).filter((c) => fs.statSync(c).isDirectory());
	const projects = folders.map((c) => Uri.file(c)).filter(isProjectFolderUri);
	for (const project of folders) {
		getChildProjects(project, levelsToGo - 1).forEach((c) => projects.push(c));
	}
	return projects;
}

export function isProjectFolderUri(folder: Uri): boolean {
	if (!folder || folder.scheme !== "file")
		return false;

	return isProjectFolder(folder.fsPath);
}

export function isProjectFolder(folder: string): boolean {
	return fs.existsSync(path.join(folder, "pubspec.yaml"));
}

export function getProjectFolder(resource: Uri): Uri {
	if (!resource || !util.isWithinWorkspace(resource))
		return null;

	let dir = resource.fsPath;
	while (dir !== path.dirname(dir)) {
		if (isProjectFolder(dir))
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
