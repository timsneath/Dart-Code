"use strict";

import * as fs from "fs";
import { TextDocumentContentProvider, Uri, CancellationToken } from "vscode";

export class TestContentProvider implements TextDocumentContentProvider {
	public provideTextDocumentContent(uri: Uri, token: CancellationToken): string {
		return `
		<h1>Inspector Demo</h1>
		<input type="button" onclick="document.querySelector('iframe').width=(document.querySelector('iframe').width == '90%' ? '50%' : '90%');" value="Change frame size" />
		<iframe src="https://blog.dantup.com/" width="90%" height="350"></iframe>
		`;
	}
}
