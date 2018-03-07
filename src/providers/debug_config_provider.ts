import * as path from "path";
import { Analytics } from "../analytics";
import { config } from "../config";
import { DebugConfigurationProvider, WorkspaceFolder, CancellationToken, DebugConfiguration, ProviderResult, commands, window, Uri, workspace } from "vscode";
import { FlutterLaunchRequestArguments, isWin } from "../debug/utils";
import { ProjectType, Sdks, isFlutterProject } from "../utils";
import { FlutterDeviceManager } from "../flutter/device_manager";
import { SdkCommands } from "../commands/sdk";
import { getProjectFolder } from "../project";

export class DebugConfigProvider implements DebugConfigurationProvider {
	private sdks: Sdks;
	private analytics: Analytics;
	private deviceManager: FlutterDeviceManager;

	constructor(sdks: Sdks, analytics: Analytics, deviceManager: FlutterDeviceManager) {
		this.sdks = sdks;
		this.analytics = analytics;
		this.deviceManager = deviceManager;
	}

	public provideDebugConfigurations(folder: WorkspaceFolder | undefined, token?: CancellationToken): ProviderResult<DebugConfiguration[]> {
		const activeFile = window.activeTextEditor && window.activeTextEditor.document && window.activeTextEditor.document.uri;
		const projectFolder = activeFile && getProjectFolder(activeFile) || folder.uri;
		const isFlutter = isFlutterProject(projectFolder);
		const workspaceFolder = workspace.getWorkspaceFolder(activeFile);
		const relativePathToScript = activeFile && workspaceFolder && path.relative(workspaceFolder.uri.fsPath, activeFile.fsPath) || `bin${path.sep}main.dart`;
		const entryScript = isFlutter
			? undefined
			: `\${workspaceRoot}${path.sep}${relativePathToScript}`;
		return [{
			name: isFlutter ? "Flutter" : "Dart",
			program: entryScript,
			request: "launch",
			type: "dart",
		}];
	}

	public resolveDebugConfiguration(folder: WorkspaceFolder | undefined, debugConfig: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {
		const projectFolder = window.activeTextEditor && window.activeTextEditor.document
			? (getProjectFolder(window.activeTextEditor.document.uri) || folder.uri)
			: folder.uri;
		const isFlutter = isFlutterProject(projectFolder);
		// TODO: This cast feels nasty?
		this.setupDebugConfig(projectFolder, debugConfig as any as FlutterLaunchRequestArguments, isFlutter, this.deviceManager && this.deviceManager.currentDevice ? this.deviceManager.currentDevice.id : null);

		if (isFlutter)
			debugConfig.program = debugConfig.program || path.join(projectFolder.fsPath, "lib", "main.dart"); // Set Flutter default path.
		else if (!debugConfig.program) {
			// For Dart projects that don't have a program, we can't launch, so we perform set type=null which causes launch.json
			// to open.
			debugConfig.type = null;
			window.showInformationMessage("Set the 'program' value in your launch config (eg ${workspaceRoot}/bin/main.dart) then launch again");
		}

		return debugConfig;
	}

	private setupDebugConfig(folder: Uri | undefined, debugConfig: FlutterLaunchRequestArguments, isFlutter: boolean, deviceId: string) {
		this.analytics.logDebuggerStart(folder);

		const dartExec = isWin ? "dart.exe" : "dart";
		const flutterExec = isWin ? "flutter.bat" : "flutter";

		const conf = config.for(folder);

		// Attach any properties that weren't explicitly set.
		debugConfig.type = debugConfig.type || "dart";
		debugConfig.request = debugConfig.request || "launch";
		debugConfig.cwd = debugConfig.cwd || folder.fsPath;
		debugConfig.args = debugConfig.args || [];
		debugConfig.dartPath = debugConfig.dartPath || path.join(this.sdks.dart, "bin", dartExec);
		debugConfig.observatoryLogFile = debugConfig.observatoryLogFile || conf.observatoryLogFile;
		debugConfig.previewDart2 = debugConfig.previewDart2 || config.previewDart2;
		debugConfig.debugSdkLibraries = debugConfig.debugSdkLibraries || conf.debugSdkLibraries;
		debugConfig.debugExternalLibraries = debugConfig.debugExternalLibraries || conf.debugExternalLibraries;
		if (debugConfig.checkedMode === undefined)
			debugConfig.checkedMode = true;
		if (isFlutter) {
			debugConfig.flutterPath = debugConfig.flutterPath || (this.sdks.flutter ? path.join(this.sdks.flutter, "bin", flutterExec) : null);
			debugConfig.flutterRunLogFile = debugConfig.flutterRunLogFile || conf.flutterRunLogFile;
			debugConfig.deviceId = debugConfig.deviceId || deviceId;
		}
	}
}
