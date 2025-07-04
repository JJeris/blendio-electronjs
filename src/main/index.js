/* eslint-disable no-undef */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  insertPythonScript,
  fetchPythonScripts,
  deletePythonScript,
  insertLaunchArgument,
  updateLaunchArgument,
  fetchLaunchArguments,
  deleteLaunchArgument,
  insertBlenderVersionInstallationLocation,
  updateBlenderVersionInstallationLocation,
  deleteBlenderVersionInstallationLocation,
  fetchBlenderVersionInstallationLocations,
  insertInstalledBlenderVersion,
  insertAndRefreshInstalledBlenderVersions,
  updateInstalledBlenderVersion,
  fetchInstalledBlenderVersions,
  uninstallAndDeleteInstalledBlenderVersionData,
  launchBlenderVersionWithLaunchArgs,
  getDownloadableBlenderVersionData,
  downloadAndInstallBlenderVersion,
  instancePopupWindow,
  downloadFile,
  insertBlendFile,
  fetchBlendFiles,
  insertAndRefreshBlendFiles,
  deleteBlendFile,
  openBlendFile,
  createNewProjectFile,
  revealProjectFileInLocalFileSystem,
  createProjectFileArchiveFile,
  identifyInternetConnection,
  showAskNotification,
  showOkNotification
} from './ipc'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    title: 'blendio-electronjs',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // mainWindow.webContents.openDevTools()

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Installed Blender Versions
  ipcMain.handle('insert-installed-blender-version', async (_event, executableFilePath) => {
    return insertInstalledBlenderVersion(_event, executableFilePath)
  })

  ipcMain.handle('insert-and-refresh-installed-blender-versions', async (_event) => {
    return insertAndRefreshInstalledBlenderVersions(_event)
  })

  ipcMain.handle('update-installed-blender-version', async (_event, id, isDefault) => {
    return updateInstalledBlenderVersion(_event, id, isDefault)
  })

  ipcMain.handle(
    'fetch-installed-blender-versions',
    async (_event, id = null, limit = null, executableFilePath = null) => {
      return fetchInstalledBlenderVersions(_event, id, limit, executableFilePath)
    }
  )

  ipcMain.handle('uninstall-and-delete-installed-blender-version-data', async (_event, id) => {
    return uninstallAndDeleteInstalledBlenderVersionData(_event, id)
  })

  ipcMain.handle(
    'launch-blender-version-with-launch-args',
    async (_event, id, launchArgumentsId = null, pythonScriptId = null) => {
      return launchBlenderVersionWithLaunchArgs(_event, id, launchArgumentsId, pythonScriptId)
    }
  )

  ipcMain.handle('get-downloadable-blender-version-data', async (_event) => {
    return getDownloadableBlenderVersionData(_event)
  })

  ipcMain.handle(
    'download-and-install-blender-version',
    async (_event, archiveFilePath, downloadableBlenderVersion) => {
      return downloadAndInstallBlenderVersion(_event, archiveFilePath, downloadableBlenderVersion)
    }
  )

  // BlenderRepoPaths
  ipcMain.handle('insert-blender-version-installation-location', async (_event) => {
    return await insertBlenderVersionInstallationLocation(_event)
  })

  ipcMain.handle('update-blender-version-installation-location', async (_event, id, isDefault) => {
    return await updateBlenderVersionInstallationLocation(_event, id, isDefault)
  })

  ipcMain.handle(
    'fetch-blender-version-installation-locations',
    async (_event, id = null, limit = null, repoDirectoryPath = null) => {
      return await fetchBlenderVersionInstallationLocations(_event, id, limit, repoDirectoryPath)
    }
  )

  ipcMain.handle('delete-blender-version-installation-location', async (_event, id) => {
    return await deleteBlenderVersionInstallationLocation(_event, id)
  })

  // LaunchArguments
  ipcMain.handle(
    'insert-launch-argument',
    async (_event, argumentString, projectFileId = null, pythonScriptId = null) => {
      return await insertLaunchArgument(_event, argumentString, projectFileId, pythonScriptId)
    }
  )

  ipcMain.handle('update-launch-argument', async (_event, id, isDefault) => {
    return await updateLaunchArgument(_event, id, isDefault)
  })

  ipcMain.handle(
    'fetch-launch-arguments',
    async (_event, id = null, limit = null, argumentString = null) => {
      return await fetchLaunchArguments(_event, id, limit, argumentString)
    }
  )

  ipcMain.handle('delete-launch-argument', async (_event, id) => {
    return await deleteLaunchArgument(_event, id)
  })

  // PythonScripts
  ipcMain.handle('insert-python-script', async (_event) => {
    return await insertPythonScript(_event)
  })

  ipcMain.handle(
    'fetch-python-script',
    async (_event, id = null, limit = null, scriptFilePath = null) => {
      return await fetchPythonScripts(_event, id, limit, scriptFilePath)
    }
  )

  ipcMain.handle('delete-python-script', async (_event, id) => {
    return await deletePythonScript(_event, id)
  })

  // Project files
  ipcMain.handle('insert-blend-file', async (_event, filePath) => {
    return await insertBlendFile(_event, filePath)
  })

  // ipcMain.handle('update-blend-file', async (_event, id, associatedSeries, lastUsedBlenderVersionId) => {
  //   return await updateBlendFile(_event, id, associatedSeries, lastUsedBlenderVersionId );
  // });

  ipcMain.handle('insert-and-refresh-blend-files', async (_event) => {
    return await insertAndRefreshBlendFiles(_event)
  })

  ipcMain.handle('fetch-blend-files', async (_event, id = null, limit = null, filePath = null) => {
    return await fetchBlendFiles(_event, id, limit, filePath)
  })

  ipcMain.handle('delete-blend-file', async (_event, id) => {
    return await deleteBlendFile(_event, id)
  })

  ipcMain.handle(
    'open-blend-file',
    async (
      _event,
      id,
      installedBlenderVersionId,
      launchArgumentsId = null,
      pythonScriptId = null
    ) => {
      return await openBlendFile(
        _event,
        id,
        installedBlenderVersionId,
        launchArgumentsId,
        pythonScriptId
      )
    }
  )

  ipcMain.handle('create-new-project-file', async (_event, installedBlenderVersionId, fileName) => {
    return await createNewProjectFile(_event, installedBlenderVersionId, fileName)
  })

  ipcMain.handle('reveal-project-file-in-local-file-system', async (_event, id) => {
    return await revealProjectFileInLocalFileSystem(_event, id)
  })

  ipcMain.handle('create-project-file-archive-file', async (_event, id) => {
    return await createProjectFileArchiveFile(_event, id)
  })

  // File system utility
  ipcMain.handle('instance-popup-window', (_event, label, title, urlPath) => {
    return instancePopupWindow(_event, label, title, urlPath)
  })

  ipcMain.handle('identify-internet-connection', (_event) => {
    return identifyInternetConnection(_event)
  })

  ipcMain.handle('show-ok-notification', async (_event, message, kind) => {
    return await showOkNotification(_event, message, kind)
  })

  ipcMain.handle('show-ask-notification', async (_event, message, kind) => {
    return await showAskNotification(_event, message, kind)
  })

  ipcMain.handle('download-file', async (event, url, filePath) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return await downloadFile(win, url, filePath)
  })

  // Listeners IPC
  ipcMain.on('download-path-selected', (event, payload) => {
    const allWindows = BrowserWindow.getAllWindows()
    for (const win of allWindows) {
      // Broadcast to all windows except sender
      if (win.webContents.id !== event.sender.id) {
        win.webContents.send('download-path-selected', payload)
      }
    }
  })

  ipcMain.on('launch-blender-instance-requested', (event, payload) => {
    const allWindows = BrowserWindow.getAllWindows()
    for (const win of allWindows) {
      if (win.webContents.id !== event.sender.id) {
        win.webContents.send('launch-blender-instance-requested', payload)
      }
    }
  })

  ipcMain.on('create-project-file-confirmed', (event, payload) => {
    const allWindows = BrowserWindow.getAllWindows()
    for (const win of allWindows) {
      if (win.webContents.id !== event.sender.id) {
        win.webContents.send('create-project-file-confirmed', payload)
      }
    }
  })

  ipcMain.on('open-project-file-confirmed', (event, payload) => {
    const allWindows = BrowserWindow.getAllWindows()
    for (const win of allWindows) {
      if (win.webContents.id !== event.sender.id) {
        win.webContents.send('open-project-file-confirmed', payload)
      }
    }
  })

  let mainWindow = createWindow()
  global.mainWindow = mainWindow

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
