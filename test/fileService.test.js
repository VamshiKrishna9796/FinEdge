// Unit tests for File Persistence Service (fs/promises)
// Uses real fs with a temp directory for reliable testing
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Create fileService with a custom data dir for tests (avoid modifying project data/)
const originalDataDir = process.cwd() + '/data';
const testDataDir = path.join(os.tmpdir(), 'finedge-fileService-test-' + Date.now());

// We need to test the actual fileService - it uses DATA_DIR from process.cwd() + 'data'
// Override by passing a different base - but fileService doesn't accept that.
// So we'll use the real implementation with a temp directory. We need to either:
// 1. Make fileService accept an optional base path (injection)
// 2. Change cwd during test
// 3. Use the actual data/ dir and clean up

// Simplest: run tests against a temp dir. The fileService uses path.join(process.cwd(), 'data').
// We can change process.cwd for the test, but that's risky. Better: add optional base path to fileService.
// For now, use the data dir relative to cwd and ensure we use unique filenames + clean up.

// Use unique test subdir within data to avoid conflicts
const testSubDir = 'test-' + Date.now();

describe('fileService', () => {
    const fileService = require('../src/services/fileService');
    let testFileName;

    beforeEach(() => {
        testFileName = `test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
    });

    afterAll(async () => {
        // Clean up test files from data/test-*
        try {
            const dataDir = path.join(process.cwd(), 'data');
            const entries = await fs.readdir(dataDir, { withFileTypes: true }).catch(() => []);
            for (const e of entries) {
                if (e.name.startsWith('test-')) {
                    const p = path.join(dataDir, e.name);
                    await fs.unlink(p).catch(() => fs.rm(p, { recursive: true }).catch(() => {}));
                }
            }
        } catch (_) {}
    });

    describe('readJsonFile', () => {
        test('should read and parse JSON file', async () => {
            const data = { key: 'value', count: 42 };
            await fileService.writeJsonFile(testFileName, data);
            const result = await fileService.readJsonFile(testFileName);
            expect(result).toEqual(data);
        });

        test('should return null when file does not exist', async () => {
            const result = await fileService.readJsonFile('nonexistent-file-xyz-12345.json');
            expect(result).toBeNull();
        });

        test('should throw for invalid JSON', async () => {
            await fileService.ensureDataDir();
            await fs.writeFile(
                path.join(fileService.DATA_DIR, testFileName),
                'not valid json {',
                'utf-8'
            );
            await expect(fileService.readJsonFile(testFileName)).rejects.toThrow();
        });
    });

    describe('writeJsonFile', () => {
        test('should create directory and write JSON', async () => {
            const data = { foo: 'bar' };
            const subPath = `test-write-${Date.now()}/snapshot.json`;
            await fileService.writeJsonFile(subPath, data);
            const result = await fileService.readJsonFile(subPath);
            expect(result).toEqual(data);
        });
    });

    describe('fileExists', () => {
        test('should return true when file exists', async () => {
            await fileService.writeJsonFile(testFileName, {});
            const result = await fileService.fileExists(testFileName);
            expect(result).toBe(true);
        });

        test('should return false when file does not exist', async () => {
            const result = await fileService.fileExists('nonexistent-xyz-789.json');
            expect(result).toBe(false);
        });
    });

    describe('deleteFile', () => {
        test('should delete existing file', async () => {
            await fileService.writeJsonFile(testFileName, { x: 1 });
            const result = await fileService.deleteFile(testFileName);
            expect(result).toBe(true);
            const exists = await fileService.fileExists(testFileName);
            expect(exists).toBe(false);
        });

        test('should return false for non-existent file', async () => {
            const result = await fileService.deleteFile('nonexistent-delete-xyz.json');
            expect(result).toBe(false);
        });
    });
});
