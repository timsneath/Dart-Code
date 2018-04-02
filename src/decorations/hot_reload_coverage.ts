import * as vs from "vscode";
import * as path from "path";
import { Analyzer } from "../analysis/analyzer";
import * as as from "../analysis/analysis_server_types";
import { isAnalyzable } from "../utils";
import { extensionPath } from "../extension";

export class HotReloadCoverageDecorations implements vs.Disposable {
	private analyzer: Analyzer;
	private subscriptions: vs.Disposable[] = [];

	private readonly executed = vs.window.createTextEditorDecorationType({
		backgroundColor: "rgba(0, 255, 0, 0.1)",
		gutterIconPath: path.join(extensionPath, "media/icons/flutter.svg"),
		gutterIconSize: "contain",
		isWholeLine: true,
		rangeBehavior: vs.DecorationRangeBehavior.OpenOpen,
	});
	private readonly notExecuted = vs.window.createTextEditorDecorationType({
		backgroundColor: "rgba(255, 0, 0, 0.3)",
		gutterIconPath: path.join(extensionPath, "media/icons/flutter.svg"),
		gutterIconSize: "contain",
		isWholeLine: true,
		rangeBehavior: vs.DecorationRangeBehavior.OpenOpen,
	});

	constructor(analyzer: Analyzer) {
		this.analyzer = analyzer;
		this.subscriptions.push(vs.window.onDidChangeActiveTextEditor((e) => this.update()));
		if (vs.window.activeTextEditor)
			this.update();

	}

	private update() {
		const activeEditor = vs.window.activeTextEditor;
		if (!activeEditor)
			return;

		activeEditor.setDecorations(this.notExecuted, [
			{ range: new vs.Range(new vs.Position(35, 0), new vs.Position(35, 1000)), hoverMessage: "This code was modified but has not yet been executed after the hot reload" },
		]);
		activeEditor.setDecorations(this.executed, [
			{ range: new vs.Range(new vs.Position(36, 0), new vs.Position(85, 1000)), hoverMessage: "This code was modified and has re-executed since the hot reload" },
		]);
	}

	public dispose() {
		this.subscriptions.forEach((s) => s.dispose());
	}
}
