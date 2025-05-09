import { dialog, BrowserWindow } from 'electron';
import path from 'path';
import decompress from 'decompress';
import fs from "fs/promises"
import { spawn } from 'child_process';

export async function extractArchive(archiveFilePath) {
    try {
        const extractDir = path.dirname(archiveFilePath);
        await decompress(archiveFilePath, extractDir);
        const archiveName = path.basename(archiveFilePath, path.extname(archiveFilePath));
        return path.join(archiveName);
    } catch (err) {
        console.error(`Failed to extract archive file: ${archiveFilePath}`, err);
        throw err;
    }
}

export async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
        throw err;
    }
}

export async function deleteDirectory(directoryPath) {
    try {
        await fs.unlink(directoryPath);
    } catch (err) {
        console.error(`Failed to delete directory: ${directoryPath}`, err);
        throw err;
    }
}

export async function launchExecutable(executableFilePath, args = []) {
    const childProcess = spawn(executableFilePath, args, {
        detached: true, 
        stdio: "ignore"
    });
    childProcess.unref();
    return null;
}

// TODO add trycatch
export async function getFileFromFileExplorer() {
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        title: 'Select Python Script',
        properties: ['openFile'],
        filters: [{ name: 'Python Files', extensions: ['py'] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }

    return result.filePaths[0];
}

// TODO add trycatch
export async function getDirectoryFromFileExplorer() {
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        title: 'Select Directory',
        properties: ['openDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }

    return result.filePaths[0];
}
