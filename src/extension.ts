import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FileProcessor, ProcessOptions } from './fileProcessor';

export function activate(context: vscode.ExtensionContext) {
	console.log('Remove Emojis extension is now active!');

	// Preview document provider
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

	// Main smart command that adapts to context
	const removeEmojis = vscode.commands.registerCommand('remove-emojis.removeEmojis', async (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
		try {
			const context = await analyzeContext(uri, uris);
			
			if (!context) {
				vscode.window.showErrorMessage('No valid target found. Please select a file, folder, or open a document.');
				return;
			}

			// Show confirmation dialog with context-specific message
			const confirmed = await showConfirmationDialog(context);
			if (!confirmed) {
				return;
			}

			// Process based on context
			await processWithContext(context);

		} catch (error) {
			vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	});

	// Quick preview command for current file
	const previewEmojis = vscode.commands.registerCommand('remove-emojis.previewEmojis', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		const document = editor.document;
		if (document.isUntitled) {
			vscode.window.showErrorMessage('Please save the file before previewing emoji removal');
			return;
		}

		await showPreview(document.fileName);
	});

	// Register preview document provider
	const previewProvider = new EmojiPreviewProvider();
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('emoji-preview', previewProvider));

	// Register commands
	context.subscriptions.push(removeEmojis, previewEmojis);

	interface ProcessingContext {
		type: 'current-file' | 'selected-files' | 'folder' | 'folder-recursive';
		targets: string[];
		description: string;
		estimatedFiles?: number;
	}

	async function analyzeContext(uri?: vscode.Uri, uris?: vscode.Uri[]): Promise<ProcessingContext | null> {
		// Case 1: Files selected from explorer
		if (uris && uris.length > 0) {
			const files = uris.map(u => u.fsPath).filter(f => !fs.statSync(f).isDirectory());
			const folders = uris.map(u => u.fsPath).filter(f => fs.statSync(f).isDirectory());
			
			if (files.length > 0 && folders.length === 0) {
				return {
					type: 'selected-files',
					targets: files,
					description: `${files.length} file(s) selected`
				};
			} else if (folders.length > 0) {
				const recursive = folders.length === 1 && await shouldProcessRecursively(folders[0]);
				return {
					type: recursive ? 'folder-recursive' : 'folder',
					targets: folders,
					description: `${folders.length} folder(s) selected${recursive ? ' (recursive)' : ''}`
				};
			}
		}

		// Case 2: Single URI from context menu
		if (uri) {
			const stats = fs.statSync(uri.fsPath);
			if (stats.isDirectory()) {
				const recursive = await shouldProcessRecursively(uri.fsPath);
				return {
					type: recursive ? 'folder-recursive' : 'folder',
					targets: [uri.fsPath],
					description: `Folder: ${path.basename(uri.fsPath)}${recursive ? ' (recursive)' : ''}`
				};
			} else {
				return {
					type: 'selected-files',
					targets: [uri.fsPath],
					description: `File: ${path.basename(uri.fsPath)}`
				};
			}
		}

		// Case 3: Current active editor
		const editor = vscode.window.activeTextEditor;
		if (editor && !editor.document.isUntitled) {
			return {
				type: 'current-file',
				targets: [editor.document.fileName],
				description: `Current file: ${path.basename(editor.document.fileName)}`
			};
		}

		// Case 4: No context, show file picker
		const files = await vscode.window.showOpenDialog({
			canSelectMany: true,
			canSelectFiles: true,
			canSelectFolders: true,
			openLabel: 'Select files or folders to process'
		});

		if (files && files.length > 0) {
			const filePaths = files.map(f => f.fsPath);
			const filesOnly = filePaths.filter(f => !fs.statSync(f).isDirectory());
			const foldersOnly = filePaths.filter(f => fs.statSync(f).isDirectory());

			if (filesOnly.length > 0 && foldersOnly.length === 0) {
				return {
					type: 'selected-files',
					targets: filesOnly,
					description: `${filesOnly.length} file(s) selected`
				};
			} else if (foldersOnly.length > 0) {
				const recursive = foldersOnly.length === 1 && await shouldProcessRecursively(foldersOnly[0]);
				return {
					type: recursive ? 'folder-recursive' : 'folder',
					targets: foldersOnly,
					description: `${foldersOnly.length} folder(s) selected${recursive ? ' (recursive)' : ''}`
				};
			}
		}

		return null;
	}

	async function shouldProcessRecursively(folderPath: string): Promise<boolean> {
		// Estimate file count for recursive processing
		const files = await FileProcessor.getFilesInDirectory(folderPath, true, ['node_modules', '.git']);
		
		if (files.length > 50) {
			const result = await vscode.window.showWarningMessage(
				`This folder contains ${files.length} files. Process recursively?`,
				'Yes, Recursive',
				'No, This Folder Only',
				'Cancel'
			);
			
			switch (result) {
				case 'Yes, Recursive':
					return true;
				case 'No, This Folder Only':
					return false;
				default:
					throw new Error('Operation cancelled');
			}
		}
		
		return files.length > 10; // Auto-choose recursive for folders with many files
	}

	async function showConfirmationDialog(context: ProcessingContext): Promise<boolean> {
		// Check if we should auto-confirm single file operations
		const config = vscode.workspace.getConfiguration('removeEmojis');
		const autoConfirm = config.get<boolean>('autoConfirmSingleFile', false);
		
		if (autoConfirm && context.type === 'current-file' && context.targets.length === 1) {
			return true;
		}

		const message = `Remove emojis from ${context.description}?`;
		const detail = context.type === 'folder' || context.type === 'folder-recursive' 
			? 'This will process all text files in the selected folder(s).'
			: 'This action cannot be undone. Consider using preview first.';

		const result = await vscode.window.showWarningMessage(
			message,
			{ modal: true, detail },
			'Remove Emojis',
			'Preview First',
			'Cancel'
		);

		if (result === 'Preview First') {
			await showPreview(context.targets[0]);
			return false;
		}

		return result === 'Remove Emojis';
	}

	async function processWithContext(context: ProcessingContext): Promise<void> {
		const options: ProcessOptions = {
			preview: false,
			recursive: context.type === 'folder-recursive',
			excludePatterns: ['node_modules', '.git', 'dist', 'out', '.vscode-test']
		};

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Removing Emojis',
			cancellable: true
		}, async (progress, token) => {
			try {
				let results: any[] = [];

				if (context.type === 'current-file') {
					progress.report({ message: 'Processing current file...' });
					const result = await FileProcessor.processFile(context.targets[0], options);
					results = [result];
					
					if (result.error) {
						throw new Error(result.error);
					}
					
					if (result.emojiCount === 0) {
						vscode.window.showInformationMessage('No emojis found in the file');
						return;
					}

					// Reload the document to show changes
					await vscode.commands.executeCommand('workbench.action.files.revert');
					vscode.window.showInformationMessage(`Removed ${result.emojiCount} emoji(s) from ${path.basename(result.file)}`);

				} else if (context.type === 'selected-files') {
					progress.report({ message: `Processing ${context.targets.length} files...` });
					results = await FileProcessor.processFiles(context.targets, options, progress);

				} else if (context.type === 'folder' || context.type === 'folder-recursive') {
					progress.report({ message: 'Scanning folder...' });
					
					const allFiles: string[] = [];
					for (const folder of context.targets) {
						const files = await FileProcessor.getFilesInDirectory(folder, options.recursive, options.excludePatterns);
						allFiles.push(...files);
					}

					if (allFiles.length === 0) {
						vscode.window.showInformationMessage('No files found in the selected folder(s)');
						return;
					}

					progress.report({ message: `Processing ${allFiles.length} files...` });
					results = await FileProcessor.processFiles(allFiles, options, progress);
				}

				// Show results summary
				await showResultsSummary(results);

			} catch (error) {
				if (token.isCancellationRequested) {
					vscode.window.showInformationMessage('Operation cancelled');
				} else {
					throw error;
				}
			}
		});
	}

	async function showPreview(target: string): Promise<void> {
		const options: ProcessOptions = {
			preview: true,
			recursive: false
		};

		const result = await FileProcessor.processFile(target, options);
		
		if (result.error) {
			vscode.window.showErrorMessage(`Error: ${result.error}`);
			return;
		}
		
		if (result.emojiCount === 0) {
			vscode.window.showInformationMessage('No emojis found in the file');
			return;
		}

		// Show diff view
		const uri = vscode.Uri.parse(`emoji-preview:${target}`);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(doc, { 
			preview: true, 
			viewColumn: vscode.ViewColumn.Beside 
		});

		// Show action buttons
		const action = await vscode.window.showInformationMessage(
			`Found ${result.emojiCount} emoji(s) in ${path.basename(target)}`,
			'Remove Emojis',
			'Close Preview'
		);

		if (action === 'Remove Emojis') {
			// Process the file for real
			const realOptions: ProcessOptions = { ...options, preview: false };
			const realResult = await FileProcessor.processFile(target, realOptions);
			
			if (realResult.error) {
				vscode.window.showErrorMessage(`Error: ${realResult.error}`);
			} else {
				// Reload the document to show changes
				await vscode.commands.executeCommand('workbench.action.files.revert');
				vscode.window.showInformationMessage(`Removed ${realResult.emojiCount} emoji(s) from ${path.basename(target)}`);
			}
		}
	}

	async function showResultsSummary(results: any[]): Promise<void> {
		const summary = FileProcessor.createSummary(results);
		
		// Create a more detailed summary for the notification
		const processedFiles = results.filter(r => !r.error && r.emojiCount > 0).length;
		const totalEmojis = results.reduce((sum, r) => sum + r.emojiCount, 0);
		
		if (processedFiles === 0) {
			vscode.window.showInformationMessage('No emojis found in any of the processed files');
			return;
		}

		// Show detailed results in output channel
		const outputChannel = vscode.window.createOutputChannel('Remove Emojis');
		outputChannel.clear();
		outputChannel.appendLine('=== Emoji Removal Results ===\n');
		outputChannel.appendLine(summary);
		
		// Check if we should auto-open results
		const config = vscode.workspace.getConfiguration('removeEmojis');
		const autoOpen = config.get<boolean>('autoOpenResults', true);
		
		if (autoOpen) {
			outputChannel.show();
		}

		// Show summary notification with action buttons
		const action = await vscode.window.showInformationMessage(
			`Removed ${totalEmojis} emoji(s) from ${processedFiles} file(s)`,
			'View Details',
			'Undo Last Operation'
		);

		if (action === 'View Details') {
			outputChannel.show();
		} else if (action === 'Undo Last Operation') {
			// TODO: Implement undo functionality
			vscode.window.showInformationMessage('Undo functionality coming soon!');
		}
	}
}

export function deactivate() {}