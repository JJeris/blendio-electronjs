import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { blenderRepoPathRepo } from './db';
import { 
  insertPythonScript, fetchPythonScripts, deletePythonScript,
  insertLaunchArgument, updateLaunchArgument, fetchLaunchArguments, deleteLaunchArgument,
  insertBlenderVersionInstallationLocation,
  updateBlenderVersionInstallationLocation,
  deleteBlenderVersionInstallationLocation,
  fetchBlenderVersionInstallationLocations,
  insertInstalledBlenderVersion,
  insertAndRefreshInstalledBlenderVersions,
  updateInstalledBlenderVersion,
  fetchInstalledBenderVersions,
  uninstallAndDeleteInstalledBlenderVersionData,
  launchBlenderVersionWithLaunchArgs
 } from './ipc';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
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
    return insertInstalledBlenderVersion(_event, executableFilePath);
  });

  ipcMain.handle('insert-and-refresh-installed-blender-versions', async (_event) => {
    return insertAndRefreshInstalledBlenderVersions(_event);
  });

  ipcMain.handle('update-installed-blender-version', async (_event, id, isDefault) => {
    return updateInstalledBlenderVersion(_event, id, isDefault);
  });

  ipcMain.handle('fetch-installed-blender-versions', async (_event, id = null, limit = null, executableFilePath = null) => {
    return fetchInstalledBenderVersions(_event, id, limit, executableFilePath);
  });

  ipcMain.handle('uninstall-and-delete-installed-blender-version-data', async (_event, id) => {
    return uninstallAndDeleteInstalledBlenderVersionData(_event, id);
  });

  ipcMain.handle('launch-blender-version-with-launch-args', async (_event, id, launchArgumentsId = null, pythonScriptId = null) => {
    return launchBlenderVersionWithLaunchArgs(_event, id, launchArgumentsId, pythonScriptId);
  });

  // BlenderRepoPaths
  ipcMain.handle('insert-blender-version-installation-location', async (_event) => {
    return await insertBlenderVersionInstallationLocation(_event);
  });

  ipcMain.handle('update-blender-version-installation-location', async (_event, id, isDefault) => {
    return await updateBlenderVersionInstallationLocation(_event, id, isDefault);
  });

  ipcMain.handle('fetch-blender-version-installation-locations', async (_event, id = null, limit = null, repoDirectoryPath = null) => {
    return await fetchBlenderVersionInstallationLocations(_event, id, limit, repoDirectoryPath);
  });

  ipcMain.handle('delete-blender-version-installation-location', async (_event, id) => {
    return await deleteBlenderVersionInstallationLocation(_event, id);
  });

  // LaunchArguments
  ipcMain.handle('insert-launch-argument', async (_event, argumentString, projectFileId = null, pythonScriptId = null) => {
    return await insertLaunchArgument(_event, argumentString, projectFileId, pythonScriptId);
  });

  ipcMain.handle('update-launch-argument', async (_event, id, isDefault) => {
    return await updateLaunchArgument(_event, id, isDefault);
  });

  ipcMain.handle('fetch-launch-arguments', async (_event, id = null, limit = null, argumentString = null) => {
    return await fetchLaunchArguments(_event, id, limit, argumentString);
  });

  ipcMain.handle('delete-launch-argument', async (_event, id) => {
    return await deleteLaunchArgument(_event, id);
  });

  // PythonScripts
  ipcMain.handle('insert-python-script', async (_event) => {
    return await insertPythonScript(_event);
  });

  ipcMain.handle('fetch-python-script', async (_event, id = null, limit = null, scriptFilePath = null) => {
    return await fetchPythonScripts(null, id, limit, scriptFilePath);
  });
  
  ipcMain.handle('delete-python-script', async (_event, id) => {
    return await deletePythonScript(null, id);
  });
  

  createWindow()

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
