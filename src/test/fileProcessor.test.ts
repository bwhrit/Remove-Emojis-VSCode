import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FileProcessor, ProcessOptions } from '../fileProcessor';

suite('FileProcessor Test Suite', () => {
    let testDir: string;
    let testFile: string;

    setup(async () => {
        // Create temporary test directory
        testDir = path.join(os.tmpdir(), `emoji-test-${Date.now()}`);
        await fs.promises.mkdir(testDir, { recursive: true });
        testFile = path.join(testDir, 'test.txt');
    });

    teardown(async () => {
        // Clean up test directory
        try {
            await fs.promises.rm(testDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    test('Should process file with emojis', async () => {
        const content = 'Hello 😀 World! 🎨 Test file.';
        await fs.promises.writeFile(testFile, content, 'utf-8');

        const options: ProcessOptions = {
            preview: false,
            recursive: false
        };

        const result = await FileProcessor.processFile(testFile, options);
        
        assert.strictEqual(result.file, testFile);
        assert.strictEqual(result.originalContent, content);
        assert.strictEqual(result.processedContent, 'Hello World! Test file.');
        assert.strictEqual(result.emojiCount, 2);
        assert.strictEqual(result.error, undefined);

        // Verify file was actually modified
        const newContent = await fs.promises.readFile(testFile, 'utf-8');
        assert.strictEqual(newContent, 'Hello World! Test file.');
    });

    test('Should handle preview mode', async () => {
        const content = 'Preview 😀 mode test';
        await fs.promises.writeFile(testFile, content, 'utf-8');

        const options: ProcessOptions = {
            preview: true,
            recursive: false
        };

        const result = await FileProcessor.processFile(testFile, options);
        
        assert.strictEqual(result.processedContent, 'Preview mode test');
        
        // Verify file was NOT modified in preview mode
        const currentContent = await fs.promises.readFile(testFile, 'utf-8');
        assert.strictEqual(currentContent, content);
    });

    test('Should skip binary files', async () => {
        const binaryFile = path.join(testDir, 'image.png');
        await fs.promises.writeFile(binaryFile, Buffer.from([0x89, 0x50, 0x4E, 0x47]));

        const options: ProcessOptions = {
            preview: false,
            recursive: false
        };

        const result = await FileProcessor.processFile(binaryFile, options);
        
        assert.strictEqual(result.error, 'Binary file skipped');
    });

    test('Should handle files without emojis', async () => {
        const content = 'No emojis in this file';
        await fs.promises.writeFile(testFile, content, 'utf-8');

        const options: ProcessOptions = {
            preview: false,
            recursive: false
        };

        const result = await FileProcessor.processFile(testFile, options);
        
        assert.strictEqual(result.emojiCount, 0);
        assert.strictEqual(result.processedContent, content);
    });

    test('Should get files in directory', async () => {
        // Create test files
        await fs.promises.writeFile(path.join(testDir, 'file1.txt'), 'test');
        await fs.promises.writeFile(path.join(testDir, 'file2.js'), 'test');
        
        // Create subdirectory with file
        const subDir = path.join(testDir, 'subdir');
        await fs.promises.mkdir(subDir);
        await fs.promises.writeFile(path.join(subDir, 'file3.txt'), 'test');

        // Test non-recursive
        let files = await FileProcessor.getFilesInDirectory(testDir, false);
        assert.strictEqual(files.length, 2);
        assert.ok(files.some(f => f.endsWith('file1.txt')));
        assert.ok(files.some(f => f.endsWith('file2.js')));

        // Test recursive
        files = await FileProcessor.getFilesInDirectory(testDir, true);
        assert.strictEqual(files.length, 3);
        assert.ok(files.some(f => f.endsWith('file3.txt')));
    });

    test('Should respect exclude patterns', async () => {
        // Create files and directories
        await fs.promises.writeFile(path.join(testDir, 'include.txt'), 'test');
        
        const nodeModules = path.join(testDir, 'node_modules');
        await fs.promises.mkdir(nodeModules);
        await fs.promises.writeFile(path.join(nodeModules, 'exclude.txt'), 'test');

        const files = await FileProcessor.getFilesInDirectory(
            testDir, 
            true, 
            ['node_modules']
        );

        assert.strictEqual(files.length, 1);
        assert.ok(files[0].endsWith('include.txt'));
    });

    test('Should create accurate summary', () => {
        const results = [
            {
                file: '/path/to/file1.txt',
                originalContent: 'Hello 😀',
                processedContent: 'Hello',
                emojiCount: 1
            },
            {
                file: '/path/to/file2.txt',
                originalContent: 'No emoji',
                processedContent: 'No emoji',
                emojiCount: 0
            },
            {
                file: '/path/to/file3.bin',
                originalContent: '',
                processedContent: '',
                emojiCount: 0,
                error: 'Binary file skipped'
            }
        ];

        const summary = FileProcessor.createSummary(results);
        
        assert.ok(summary.includes('Total files scanned: 3'));
        assert.ok(summary.includes('Files with emojis: 1'));
        assert.ok(summary.includes('Files skipped: 1'));
        assert.ok(summary.includes('Total emojis removed: 1'));
        assert.ok(summary.includes('file1.txt: 1 emoji(s) removed'));
    });
});