/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-useless-catch */
import { dialog, BrowserWindow } from 'electron'
import path from 'path'
import fsPromise from 'fs/promises'
import { spawn, execFile } from 'child_process'
import { promisify } from 'util'
import { is } from '@electron-toolkit/utils'
import { archiveFile as zipLibArchiveFile, extract } from 'zip-lib'
// import { extract, Zip, archiveFile as zipLibArchiveFile } from 'zip-lib/lib';

/**
 * ID: FSU_001
 * Paskaidrojums:
 * ABC analīzes rezultāts:7,7,5
 */
export function instancePopupWindow(_, label, title, urlPath = '/') {
  try {
    // C (3.d.) try
    let popupWindow = new BrowserWindow({
      // A (1.a.) let popupWindow =; B (2.b.) new BrowserWindow
      width: 600,
      height: 400,
      title,
      show: false,
      autoHideMenuBar: true,
      resizable: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'), // B (2.a.) .join()
        sandbox: false,
        devTools: true
      }
    })
    popupWindow.on('ready-to-show', () => {
      // A (1.e.) .on()
      popupWindow.show() // A (1.e.) .show()
    })
    popupWindow.webContents.setWindowOpenHandler((details) => {
      // A (1.e.) .setWindowOpenHandler(); B (2.a.) (details) => {...}
      shell.openExternal(details.url) // A (1.e.) .openExternal()
      return { action: 'deny' } // B (2.c.) priekšlaicīgs return
    })
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      // C (3.a.) is.dev == true; C (3.a.) process.env['ELECTRON_RENDERER_URL'] == true
      popupWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?route=/${urlPath}`) // A (1.e.) .loadURL()
    } else {
      // C (3.b.) else;
      popupWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
        // A (1.e.) .loadFile(); B (2.a.) .join()
        query: { route: `/${urlPath}` }
      })
    }
    return
  } catch (err) {
    // C (3.d.) catch
    showOkNotification(`Failed to instance popup window: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: FSU_002
 * Paskaidrojums:
 * ABC analīzes rezultāts:1,2,2
 */
export async function identifyInternetConnection(_) {
  try {
    // C (3.d.) try
    let response = await fetch('https://one.one.one.one/', { signal: AbortSignal.timeout(3000) }) // A (1.a.) let response =; B (2.a.) fetch(); B (2.a.) .timeout()
    return response.ok
  } catch (err) {
    // C (3.d.) catch
    return false
  }
}

/**
 * ID: FSU_003
 * Paskaidrojums:
 * ABC analīzes rezultāts:0,1,0
 */
export async function showOkNotification(message, kind) {
  await dialog.showMessageBox(global.mainWindow, {
    // B (2.b.) .showMessageBox()
    type: kind, // 'info', 'warning', or 'error'
    message: message,
    buttons: ['OK'],
    defaultId: 0
  })
}

/**
 * ID: FSU_004
 * Paskaidrojums:
 * ABC analīzes rezultāts:1,1,1
 */
export async function showAskNotification(message, kind) {
  let result = await dialog.showMessageBox(global.mainWindow, {
    // A (1.a.) let result =; B (2.b.) .showMessageBox()
    type: kind, // 'info', 'warning', or 'error'
    message: message,
    buttons: ['Yes', 'No'],
    defaultId: 0,
    cancelId: 1
  })
  return result.response === 0 // C (3.a.) result.response === 0
}

/**
 * ID: FSU_005
 * Paskaidrojums:
 * ABC analīzes rezultāts:2,6,2
 */
export async function extractArchive(archiveFilePath) {
  try {
    // C (3.d.) try
    let extractDir = path.dirname(archiveFilePath) // A (1.a.) let extractDir =; B (2.a.) path.dirname()
    await extract(archiveFilePath, extractDir) // B (2.a.) extract()
    let archiveName = path.basename(archiveFilePath, path.extname(archiveFilePath)) // A (1.a.) let archiveName =; B (2.a.) .basename(); B (2.a.) .extname()
    return path.join(extractDir, archiveName) // B (2.a.) .join()
  } catch (err) {
    // C (3.d.) catch
    throw `Failed to extract archive file: ${err}` // B (2.c.) throw
  }
}

/**
 * ID: FSU_006
 * Paskaidrojums:
 * ABC analīzes rezultāts:1,4,2
 */
export async function archiveFile(filePath) {
  try {
    // C (3.d.) try
    let zipPath = filePath.replace(path.extname(filePath), '.zip') // A (1.a.) let zipPath =; B (2.a.) .replace(); B (2.a.) .extname();
    await zipLibArchiveFile(filePath, zipPath) // B (2.a.) zipLibArchiveFile()
    return zipPath
  } catch (err) {
    // C (3.d.) catch
    throw `Failed to archive file: ${err}` // B (2.c.) throw
  }
}

/**
 * ID: FSU_007
 * Paskaidrojums:
 * ABC analīzes rezultāts:1,3,2
 */
export async function launchExecutable(executableFilePath, args = []) {
  try {
    // C (3.d.) try
    let execFileAsync = promisify(execFile) // A (1.a.) let execFileAsync =; B (2.a.) promisify()
    await execFileAsync(executableFilePath, args) // B (2.a.) execFileAsync()
  } catch (err) {
    // C (3.d.) catch
    throw `Failed to launch executable: ${err}` // B (2.c.) throw
  }
}

/**
 * ID: FSU_008
 * Paskaidrojums:
 * ABC analīzes rezultāts:7,9,8
 */
export async function openInFileExplorer(filePath) {
  try {
    // C (3.d.) try
    let parentDirectory = path.dirname(filePath) // A (1.a.) let parentDirectory =; B (2.a.) .dirname()
    if (!parentDirectory) {
      // C (3.a.) parentDirectory != truthy
      throw 'Failed to find parent directory in file path' // B (2.c.) throw
    }
    let command
    let args
    switch (
      process.platform // C (3.b.) switch
    ) {
      case 'win32': // C (3.b.) case
        command = 'explorer' // A (1.a.) command =
        args = [parentDirectory] // A (1.a.) args =
        break // B (2.c.) break
      case 'darwin': // C (3.b.) case
        command = 'open' // A (1.a.) command =
        args = [parentDirectory] // A (1.a.) args =
        break // B (2.c.) break
      case 'linux': // C (3.b.) case
        command = 'xdg-open' // A (1.a.) command =
        args = [parentDirectory] // A (1.a.) args =
        break // B (2.c.) break
      default: // C (3.b.) default
        return null // B (2.c.) priekšlaicīgs return
    }
    spawn(command, args, { detached: true, stdio: 'ignore' }).unref() // B (2.a.) spawn() ; B (2.a.) .unref()
    return
  } catch (err) {
    // C (3.d.) catch
    throw `Failed to open file in file explorer: ${err}` // B (2.c.) throw
  }
}

/**
 * ID: FSU_009
 * Paskaidrojums:
 * ABC analīzes rezultāts:1,4,4
 */
export async function getFileFromFileExplorer() {
  try {
    // C (3.d.) try
    let result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      // A (1.a.) let result =; B (2.a.) .showOpenDialog(); B (2.a.) .getFocusedWindow()
      title: 'Select File',
      properties: ['openFile'],
      filters: [{ name: 'Python Files', extensions: ['py'] }]
    })
    if (result.canceled || result.filePaths.length === 0) {
      // C (3.a.) result.canceled == true; C (3.a.) result.filePaths.length === 0
      return null // B (2.c.) priekšlaicīgs return
    }
    return result.filePaths[0]
  } catch (err) {
    // C (3.d.) catch
    throw `Failed to get file from file explorer: ${err}` // B (2.c.) throw
  }
}

/**
 * ID: FSU_010
 * Paskaidrojums:
 * ABC analīzes rezultāts:1,3,4
 */
export async function getDirectoryFromFileExplorer() {
  try {
    // C (3.d.) try
    let result = await dialog.showOpenDialog(global.mainWindow, {
      // A (1.a.) let result =; B (2.a.) .showOpenDialog();
      title: 'Select Folder',
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      // C (3.a.) result.canceled == true; C (3.a.) result.filePaths.length === 0
      return null // B (2.c.) priekšlaicīgs return
    }
    return result.filePaths[0]
  } catch (err) {
    // C (3.d.) catch
    throw `Failed to get directory from file explorer: ${err}` // B (2.c.) throw
  }
}

/**
 * ID: FSU_011
 * Paskaidrojums:
 * ABC analīzes rezultāts:0,2,2
 */
export async function deleteFile(filePath) {
  try {
    // C (3.d.) try
    await fsPromise.unlink(filePath) // B (2.a.) .unlink()
  } catch (err) {
    // C (3.d.) catch
    throw `Failed to delete file: ${err}` // B (2.c.) throw
  }
}

/**
 * ID: FSU_012
 * Paskaidrojums:
 * ABC analīzes rezultāts:0,2,2
 */
export async function deleteDirectory(directoryPath) {
  try {
    // C (3.d.) try
    await fsPromise.rm(directoryPath, { recursive: true, force: true }) // B (2.a.) .rm()
  } catch (err) {
    // C (3.d.) catch
    throw `Failed to delete directory: ${err}` // B (2.c.) throw
  }
}

export async function downloadFile(window, url, filePath) {
  try {
    // C (3.d.) try
    const { download } = await import('electron-dl') // dynamic import

    let lastPercent = 0
    await download(window, url, {
      saveAs: false,
      directory: path.dirname(filePath),
      filename: path.basename(filePath),
      onProgress: (progress) => {
        const percent = Math.floor(progress.percent * 100)
        if (percent !== lastPercent) {
          lastPercent = percent
          window.webContents.send('download-progress', { filePath, percent })
        }
      }
    })
    return null
  } catch (err) {
    // C (3.d.) catch
    console.error(err)
    return null
  }
}
