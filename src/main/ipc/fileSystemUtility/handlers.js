import { dialog, BrowserWindow, app } from 'electron';
import path from 'path';
import decompress from 'decompress';
import fs from "fs";
import fsPromise from "fs/promises"
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import { is } from '@electron-toolkit/utils';
import { download } from 'electron-dl';
import yazl from 'yazl';

export function instancePopupWindow(label, title, urlPath = '/') {
    const popupWindow = new BrowserWindow({
        width: 600,
        height: 400,
        title,
        show: false,
        autoHideMenuBar: true,
        resizable: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            sandbox: false,
            devTools: true
        }
    });

    popupWindow.on('ready-to-show', () => {
        popupWindow.show();
    });

    popupWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });

    // popupWindow.webContents.openDevTools();

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        popupWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?route=/${urlPath}`);
    } else {
        popupWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
            query: { route: `/${urlPath}` }
        });
    }

    return null;
}

export async function extractArchive(archiveFilePath) {
    try {
        const extractDir = path.dirname(archiveFilePath);
        await decompress(archiveFilePath, extractDir);
        const archiveName = path.basename(archiveFilePath, path.extname(archiveFilePath));
        return path.join(extractDir, archiveName);
    } catch (err) {
        console.error(`Failed to extract archive file: ${archiveFilePath}`, err);
        throw err;
    }
}

export async function deleteFile(filePath) {
    try {
        await fsPromise.unlink(filePath);
    } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
        throw err;
    }
}

export async function deleteDirectory(directoryPath) {
    try {
        await fsPromise.rm(directoryPath, {recursive: true, force: true});
    } catch (err) {
        console.error(`Failed to delete directory: ${directoryPath}`, err);
        throw err;
    }
}

export async function launchExecutable(executableFilePath, args = []) {
    try {
        const execFileAsync = promisify(execFile);
        await execFileAsync(executableFilePath, args);
    } catch (err) {
        console.error(`Failed to launch executable`, err);
        throw err;
    }
}

export async function openInFileExplorer(filePath) {
    try {
         const parentDirectory = path.dirname(filePath);
        if (!parentDirectory) {
            throw "";
        }
        let command;
        let args;
        switch (process.platform) {
            case 'win32':
                command = 'explorer';
                args = [parentDirectory];
                break;
            case 'darwin':
                command = 'open';
                args = [parentDirectory];
                break;
            case 'linux':
                command = 'xdg-open';
                args = [parentDirectory];
                break;
            default:
                return null;
        }
        spawn(command, args, { detached: true, stdio: 'ignore' }).unref();
        return true;
    } catch (err) {
        console.error("Failed to open file explorer:", err);
        throw "";
    }
}

export async function getFileFromFileExplorer() {
    try {
        const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
            title: 'Select File',
            properties: ['openFile'],
            filters: [{ name: 'Python Files', extensions: ['py'] }]
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    } catch (error) {
        throw "";
    }
}

export async function getDirectoryFromFileExplorer() {
    try {
        const result = await dialog.showOpenDialog(global.mainWindow, {
            title: 'Select Folder',
            properties: ['openDirectory']
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function archiveFile(filePath) {
    const fileName = path.basename(filePath);
    const zipPath = filePath.replace(path.extname(filePath), '.zip');
    const zipFile = new yazl.ZipFile();
    const writeStream = fs.createWriteStream(zipPath);
    return new Promise((resolve, reject) => {
        writeStream.on('close', () => resolve(zipPath));
        writeStream.on('error', (err) => {
            console.error('Error writing zip file:', err);
            reject(err);
        });
        zipFile.outputStream.pipe(writeStream);
        try {
            zipFile.addFile(filePath, fileName, { compress: false }); // no compression
            zipFile.end();
        } catch (err) {
            console.error('Error zipping file:', err);
            reject(err);
        }
    });
}

export async function downloadFile(window, url, filePath) {
    try {
        let lastPercent = 0;
        await download(window, url, {
            saveAs: false,
            directory: path.dirname(filePath),
            filename: path.basename(filePath),
            onProgress: (progress) => {
                const percent = Math.floor(progress.percent * 100);
                if (percent !== lastPercent) {
                    lastPercent = percent;
                    window.webContents.send('download-progress', { filePath, percent });
                }
            }
        })
        return null;
    } catch (err) {
        console.error(err);
        return null;
    }
}