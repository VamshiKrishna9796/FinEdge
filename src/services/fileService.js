// Reusable file read/write service using fs/promises
// Used for JSON file persistence (backups, summary snapshots, config)
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Ensure the data directory exists
 */
async function ensureDataDir(dirPath = DATA_DIR) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        return dirPath;
    } catch (err) {
        throw new Error(`Failed to create directory ${dirPath}: ${err.message}`);
    }
}

/**
 * Read JSON from a file
 * @param {string} filePath - Relative path from data dir or absolute path
 * @param {object} options - { absolute: true } if filePath is absolute
 * @returns {Promise<object>} Parsed JSON data, or null if file doesn't exist
 */
async function readJsonFile(filePath, options = {}) {
    const fullPath = options.absolute ? filePath : path.join(DATA_DIR, filePath);
    try {
        const content = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return null;
        }
        throw new Error(`Failed to read file ${fullPath}: ${err.message}`);
    }
}

/**
 * Write JSON to a file
 * @param {string} filePath - Relative path from data dir or absolute path
 * @param {object} data - Data to serialize as JSON
 * @param {object} options - { absolute: true } if filePath is absolute
 * @returns {Promise<void>}
 */
async function writeJsonFile(filePath, data, options = {}) {
    const fullPath = options.absolute ? filePath : path.join(DATA_DIR, filePath);
    await ensureDataDir(path.dirname(fullPath));
    try {
        const content = JSON.stringify(data, null, 2);
        await fs.writeFile(fullPath, content, 'utf-8');
    } catch (err) {
        throw new Error(`Failed to write file ${fullPath}: ${err.message}`);
    }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath, options = {}) {
    const fullPath = options.absolute ? filePath : path.join(DATA_DIR, filePath);
    try {
        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Delete a file
 */
async function deleteFile(filePath, options = {}) {
    const fullPath = options.absolute ? filePath : path.join(DATA_DIR, filePath);
    try {
        await fs.unlink(fullPath);
        return true;
    } catch (err) {
        if (err.code === 'ENOENT') return false;
        throw new Error(`Failed to delete file ${fullPath}: ${err.message}`);
    }
}

module.exports = {
    readJsonFile,
    writeJsonFile,
    fileExists,
    deleteFile,
    ensureDataDir,
    DATA_DIR
};
