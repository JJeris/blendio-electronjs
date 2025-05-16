/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-useless-catch */
import { dialog, BrowserWindow } from 'electron';
import path from 'path';
import fs from "fs";
import fsPromise from "fs/promises"
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import { is } from '@electron-toolkit/utils';
import { download } from 'electron-dl';
import { extract, Zip, archiveFile as zipLibArchiveFile } from 'zip-lib/lib';

/**
 * ID: FSU_001
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export function instancePopupWindow(_, label, title, urlPath = '/') {
    try {
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
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            popupWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?route=/${urlPath}`);
        } else {
            popupWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
                query: { route: `/${urlPath}` }
            });
        }
        return;
    } catch (err) {
        showOkNotification(`Failed to instance popup window: ${err}`, "error");
        throw err;
    }
 
}

/**
 * ID: FSU_002
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function identifyInternetConnection(_) {
    try {
        const response = await fetch("https://one.one.one.one/", {signal: AbortSignal.timeout(3000)});
        return response.ok;
    } catch (err) {
        return false;
    }
}

/**
 * ID: FSU_003
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function showOkNotification(message, kind) {
    const win = global.mainWindow;
    await dialog.showMessageBox(win, {
      type: kind, // 'info', 'warning', or 'error'
      message: message,
      buttons: ['OK'],
      defaultId: 0,
    });
}

/**
 * ID: FSU_004
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function showAskNotification(message, kind) {
    const win = global.mainWindow;
    const result = await dialog.showMessageBox(win, {
      type: kind, // 'info', 'warning', or 'error'
      message: message,
      buttons: ['Yes', 'No'],
      defaultId: 0,
      cancelId: 1,
    });
    return result.response === 0;
}

/**
 * ID: FSU_005
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function extractArchive(archiveFilePath) {
    try {
        const extractDir = path.dirname(archiveFilePath);
        await extract(archiveFilePath, extractDir);
        const archiveName = path.basename(archiveFilePath, path.extname(archiveFilePath));
        return path.join(extractDir, archiveName);
    } catch (err) {
        throw `Failed to extract archive file: ${err}`;
    }
}

/**
 * ID: FSU_006
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function archiveFile(filePath) {
    try {
        const fileName = path.basename(filePath);
        const zipPath = filePath.replace(path.extname(filePath), '.zip');
        await zipLibArchiveFile(filePath, zipPath);
        return zipPath;
    } catch (err) {
        throw `Failed to archive file: ${err}`;
    }
}

/**
 * ID: FSU_007
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function launchExecutable(executableFilePath, args = []) {
    try {
        const execFileAsync = promisify(execFile);
        await execFileAsync(executableFilePath, args);
    } catch (err) {
        throw `Failed to launch executable: ${err}`;
    }
}

/**
 * ID: FSU_008
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
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
        return;
    } catch (err) {
        throw `Failed to open file in file explorer: ${err}`;
    }
}

/**
 * ID: FSU_009
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
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
    } catch (err) {
        throw `Failed to get file from file explorer: ${err}`;
    }
}

/**
 * ID: FSU_010
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
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
        throw `Failed to get directory from file explorer: ${err}`;
    }
}

/**
 * ID: FSU_011
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function deleteFile(filePath) {
    try {
        await fsPromise.unlink(filePath);
    } catch (err) {
        throw `Failed to delete file: ${err}`;
    }
}

/**
 * ID: FSU_012
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function deleteDirectory(directoryPath) {
    try {
        await fsPromise.rm(directoryPath, {recursive: true, force: true});
    } catch (err) {
        throw `Failed to delete directory: ${err}`;
    }
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