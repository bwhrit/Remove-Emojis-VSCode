import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EmojiDetector } from './emojiDetector';

export interface ProcessResult {
    file: string;
    originalContent: string;
    processedContent: string;
    emojiCount: number;
    error?: string;
}

export interface ProcessOptions {
    preview: boolean;
    recursive: boolean;
    excludePatterns?: string[];
}

export class FileProcessor {
    private static readonly BINARY_EXTENSIONS = new Set([
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.webp',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.exe', '.dll', '.so', '.dylib',
        '.mp3', '.mp4', '.avi', '.mkv', '.mov',
        '.ttf', '.otf', '.woff', '.woff2'
    ]);

    /**
     * Checks if a file is binary based on extension
     */
    private static isBinaryFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        return this.BINARY_EXTENSIONS.has(ext);
    }

    /**
     * Processes a single file
     */
    static async processFile(filePath: string, options: ProcessOptions): Promise<ProcessResult> {
        const result: ProcessResult = {
            file: filePath,
            originalContent: '',
            processedContent: '',
            emojiCount: 0
        };

        try {
            // Check if file is binary
            if (this.isBinaryFile(filePath)) {
                result.error = 'Binary file skipped';
                return result;
            }

            // Read file content
            const content = await fs.promises.readFile(filePath, 'utf-8');
            result.originalContent = content;

            // Check if file contains emojis
            if (!EmojiDetector.containsEmoji(content)) {
                result.processedContent = content;
                return result;
            }

            // Count emojis
            result.emojiCount = EmojiDetector.countEmojis(content);

            // Remove emojis
            result.processedContent = EmojiDetector.removeEmojis(content);

            // Write back to file if not in preview mode
            if (!options.preview && result.processedContent !== result.originalContent) {
                await fs.promises.writeFile(filePath, result.processedContent, 'utf-8');
            }

        } catch (error) {
            result.error = error instanceof Error ? error.message : 'Unknown error';
        }

        return result;
    }

    /**
     * Processes multiple files
     */
    static async processFiles(files: string[], options: ProcessOptions, 
        progress?: vscode.Progress<{ message?: string; increment?: number }>): Promise<ProcessResult[]> {
        
        const results: ProcessResult[] = [];
        const totalFiles = files.length;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (progress) {
                progress.report({
                    message: `Processing ${path.basename(file)} (${i + 1}/${totalFiles})`,
                    increment: (100 / totalFiles)
                });
            }
            
            const result = await this.processFile(file, options);
            results.push(result);
        }
        
        return results;
    }

    /**
     * Gets all files in a directory
     */
    static async getFilesInDirectory(dirPath: string, recursive: boolean, excludePatterns?: string[]): Promise<string[]> {
        const files: string[] = [];
        
        async function scanDirectory(dir: string) {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                // Check exclusion patterns
                if (excludePatterns) {
                    const relativePath = path.relative(dirPath, fullPath);
                    const shouldExclude = excludePatterns.some(pattern => {
                        return relativePath.includes(pattern) || entry.name.startsWith('.');
                    });
                    if (shouldExclude) {
                        continue;
                    }
                }
                
                if (entry.isDirectory() && recursive) {
                    await scanDirectory(fullPath);
                } else if (entry.isFile()) {
                    files.push(fullPath);
                }
            }
        }
        
        await scanDirectory(dirPath);
        return files;
    }

    /**
     * Creates a summary of processing results
     */
    static createSummary(results: ProcessResult[]): string {
        const totalFiles = results.length;
        const processedFiles = results.filter(r => !r.error && r.emojiCount > 0).length;
        const skippedFiles = results.filter(r => r.error).length;
        const totalEmojis = results.reduce((sum, r) => sum + r.emojiCount, 0);
        
        const lines = [
            `Total files scanned: ${totalFiles}`,
            `Files with emojis: ${processedFiles}`,
            `Files skipped: ${skippedFiles}`,
            `Total emojis removed: ${totalEmojis}`,
            ''
        ];
        
        // Add details for files with emojis
        if (processedFiles > 0) {
            lines.push('Files processed:');
            results
                .filter(r => !r.error && r.emojiCount > 0)
                .forEach(r => {
                    lines.push(`  - ${path.basename(r.file)}: ${r.emojiCount} emoji(s) removed`);
                });
        }
        
        // Add errors if any
        const errors = results.filter(r => r.error && !r.error.includes('Binary file'));
        if (errors.length > 0) {
            lines.push('', 'Errors:');
            errors.forEach(r => {
                lines.push(`  - ${path.basename(r.file)}: ${r.error}`);
            });
        }
        
        return lines.join('\n');
    }
}