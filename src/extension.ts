import * as vscode from 'vscode';
import * as path from 'path';
import { FileProcessor, ProcessOptions } from './fileProcessor';

export function activate(context: vscode.ExtensionContext) {
	console.log('Remove Emojis extension is now active!');

	// Command: Remove emojis from current file
	const removeFromCurrentFile = vscode.commands.registerCommand('remove-emojis.removeFromCurrentFile', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		const document = editor.document;
		if (document.isUntitled) {
			vscode.window.showErrorMessage('Please save the file before removing emojis');
			return;
		}

		const options: ProcessOptions = {
			preview: false,
			recursive: false
		};

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Removing emojis',
			cancellable: false
		}, async (progress) => {
			progress.report({ message: 'Processing file...' });
			
			const result = await FileProcessor.processFile(document.fileName, options);
			
			if (result.error) {
				vscode.window.showErrorMessage(`Error: ${result.error}`);
			} else if (result.emojiCount === 0) {
				vscode.window.showInformationMessage('No emojis found in the file');
			} else {
				// Reload the document to show changes
				await vscode.commands.executeCommand('workbench.action.files.revert');
				vscode.window.showInformationMessage(`Removed ${result.emojiCount} emoji(s) from ${path.basename(result.file)}`);
			}
		});
	});

	// Command: Remove emojis from selected files
	const removeFromSelectedFiles = vscode.commands.registerCommand('remove-emojis.removeFromSelectedFiles', async (uri: vscode.Uri, uris: vscode.Uri[]) => {
		const files = uris ? uris.map(u => u.fsPath) : (uri ? [uri.fsPath] : []);
		
		if (files.length === 0) {
			// If no files selected from explorer, show file picker
			const selectedFiles = await vscode.window.showOpenDialog({
				canSelectMany: true,
				openLabel: 'Select files',
				filters: {
					'All files': ['*']
				}
			});
			
			if (selectedFiles) {
				files.push(...selectedFiles.map(f => f.fsPath));
			}
		}
		
		if (files.length === 0) {
			vscode.window.showErrorMessage('No files selected');
			return;
		}

		const options: ProcessOptions = {
			preview: false,
			recursive: false
		};

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Removing emojis',
			cancellable: false
		}, async (progress) => {
			const results = await FileProcessor.processFiles(files, options, progress);
			const summary = FileProcessor.createSummary(results);
			
			// Show results in output channel
			const outputChannel = vscode.window.createOutputChannel('Remove Emojis');
			outputChannel.clear();
			outputChannel.appendLine('=== Emoji Removal Results ===\n');
			outputChannel.appendLine(summary);
			outputChannel.show();
		});
	});

	// Command: Remove emojis from folder
	const removeFromFolder = vscode.commands.registerCommand('remove-emojis.removeFromFolder', async (uri?: vscode.Uri) => {
		let folderPath: string | undefined;
		
		if (uri) {
			folderPath = uri.fsPath;
		} else {
			const folders = await vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				openLabel: 'Select folder'
			});
			
			if (folders && folders.length > 0) {
				folderPath = folders[0].fsPath;
			}
		}
		
		if (!folderPath) {
			vscode.window.showErrorMessage('No folder selected');
			return;
		}

		await processFolder(folderPath, false);
	});

	// Command: Remove emojis from folder recursively
	const removeFromFolderRecursive = vscode.commands.registerCommand('remove-emojis.removeFromFolderRecursive', async (uri?: vscode.Uri) => {
		let folderPath: string | undefined;
		
		if (uri) {
			folderPath = uri.fsPath;
		} else {
			const folders = await vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				openLabel: 'Select folder'
			});
			
			if (folders && folders.length > 0) {
				folderPath = folders[0].fsPath;
			}
		}
		
		if (!folderPath) {
			vscode.window.showErrorMessage('No folder selected');
			return;
		}

		await processFolder(folderPath, true);
	});

	// Command: Preview emoji removal
	const previewRemoval = vscode.commands.registerCommand('remove-emojis.preview', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		const document = editor.document;
		const options: ProcessOptions = {
			preview: true,
			recursive: false
		};

		const result = await FileProcessor.processFile(document.fileName, options);
		
		if (result.error) {
			vscode.window.showErrorMessage(`Error: ${result.error}`);
			return;
		}
		
		if (result.emojiCount === 0) {
			vscode.window.showInformationMessage('No emojis found in the file');
			return;
		}

		// Show diff
		const uri = vscode.Uri.parse(`emoji-preview:${document.fileName}`);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
	});

	// Helper function to process a folder
	async function processFolder(folderPath: string, recursive: boolean) {
		const options: ProcessOptions = {
			preview: false,
			recursive: recursive,
			excludePatterns: ['node_modules', '.git', 'dist', 'out', '.vscode-test']
		};

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Removing emojis',
			cancellable: false
		}, async (progress) => {
			progress.report({ message: 'Scanning folder...' });
			
			const files = await FileProcessor.getFilesInDirectory(folderPath, recursive, options.excludePatterns);
			
			if (files.length === 0) {
				vscode.window.showInformationMessage('No files found in the selected folder');
				return;
			}
			
			const results = await FileProcessor.processFiles(files, options, progress);
			const summary = FileProcessor.createSummary(results);
			
			// Show results in output channel
			const outputChannel = vscode.window.createOutputChannel('Remove Emojis');
			outputChannel.clear();
			outputChannel.appendLine('=== Emoji Removal Results ===\n');
			outputChannel.appendLine(summary);
			outputChannel.show();
		});
	}

	// Register preview document provider
	const previewProvider = new EmojiPreviewProvider();
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('emoji-preview', previewProvider));

	// Register all commands
	context.subscriptions.push(
		removeFromCurrentFile,
		removeFromSelectedFiles,
		removeFromFolder,
		removeFromFolderRecursive,
		previewRemoval
	);
}

class EmojiPreviewProvider implements vscode.TextDocumentContentProvider {
	async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
		const originalPath = uri.path;
		const options: ProcessOptions = {
			preview: true,
			recursive: false
		};
		
		const result = await FileProcessor.processFile(originalPath, options);
		return result.processedContent;
	}
}

export function deactivate() {}