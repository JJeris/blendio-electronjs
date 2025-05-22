/* eslint-disable no-undef */
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer.
const api = {
  // Blender Version Installation Locations (Repo Paths)
  insertBlenderVersionInstallationLocation: () =>
    ipcRenderer.invoke('insert-blender-version-installation-location'),
  updateBlenderVersionInstallationLocation: (id, isDefault) =>
    ipcRenderer.invoke('update-blender-version-installation-location', id, isDefault),
  fetchBlenderVersionInstallationLocations: (id = null, limit = null, repoDirectoryPath = null) =>
    ipcRenderer.invoke(
      'fetch-blender-version-installation-locations',
      id,
      limit,
      repoDirectoryPath
    ),
  deleteBlenderVersionInstallationLocation: (id) =>
    ipcRenderer.invoke('delete-blender-version-installation-location', id),

  // Installed Blender Versions
  insertInstalledBlenderVersion: (executableFilePath) =>
    ipcRenderer.invoke('insert-installed-blender-version', executableFilePath),
  insertAndRefreshInstalledBlenderVersions: () =>
    ipcRenderer.invoke('insert-and-refresh-installed-blender-versions'),
  updateInstalledBlenderVersion: (id, isDefault) =>
    ipcRenderer.invoke('update-installed-blender-version', id, isDefault),
  fetchInstalledBlenderVersions: (id = null, limit = null, executableFilePath = null) =>
    ipcRenderer.invoke('fetch-installed-blender-versions', id, limit, executableFilePath),
  uninstallAndDeleteInstalledBlenderVersionData: (id) =>
    ipcRenderer.invoke('uninstall-and-delete-installed-blender-version-data', id),
  launchBlenderVersionWithLaunchArgs: (id, launchArgumentsId = null, pythonScriptId = null) =>
    ipcRenderer.invoke(
      'launch-blender-version-with-launch-args',
      id,
      launchArgumentsId,
      pythonScriptId
    ),
  getDownloadableBlenderVersionData: () =>
    ipcRenderer.invoke('get-downloadable-blender-version-data'),
  downloadAndInstallBlenderVersion: (archiveFilePath, downloadableBlenderVersion) =>
    ipcRenderer.invoke(
      'download-and-install-blender-version',
      archiveFilePath,
      downloadableBlenderVersion
    ),

  // Launch Arguments
  insertLaunchArgument: (argumentString, projectFileId = null, pythonScriptId = null) =>
    ipcRenderer.invoke('insert-launch-argument', argumentString, projectFileId, pythonScriptId),
  updateLaunchArgument: (id, isDefault) =>
    ipcRenderer.invoke('update-launch-argument', id, isDefault),
  fetchLaunchArguments: (id = null, limit = null, argumentString = null) =>
    ipcRenderer.invoke('fetch-launch-arguments', id, limit, argumentString),
  deleteLaunchArgument: (id) => ipcRenderer.invoke('delete-launch-argument', id),

  // Python Scripts
  insertPythonScript: () => ipcRenderer.invoke('insert-python-script'),
  fetchPythonScripts: (id = null, limit = null, scriptFilePath = null) =>
    ipcRenderer.invoke('fetch-python-script', id, limit, scriptFilePath),
  deletePythonScript: (id) => ipcRenderer.invoke('delete-python-script', id),

  // Blend files
  insertBlendFile: (filePath) => ipcRenderer.invoke('insert-blend-file', filePath),
  // updateBlendFile: (id, associatedSeries, lastUsedBlenderVersionId) => ipcRenderer.invoke('update-blend-file', id, associatedSeries, lastUsedBlenderVersionId),
  insertAndRefreshBlendFiles: () => ipcRenderer.invoke('insert-and-refresh-blend-files'),
  fetchBlendFiles: (id = null, limit = null, filePath = null) =>
    ipcRenderer.invoke('fetch-blend-files', id, limit, filePath),
  deleteBlendFile: (id) => ipcRenderer.invoke('delete-blend-file', id),
  openBlendFile: (id, installedBlenderVersionId, launchArgumentsId = null, pythonScriptId = null) =>
    ipcRenderer.invoke(
      'open-blend-file',
      id,
      installedBlenderVersionId,
      launchArgumentsId,
      pythonScriptId
    ),
  createNewProjectFile: (installedBlenderVersionId, fileName) =>
    ipcRenderer.invoke('create-new-project-file', installedBlenderVersionId, fileName),
  revealProjectFileInLocalFileSystem: (id) =>
    ipcRenderer.invoke('reveal-project-file-in-local-file-system', id),
  createProjectFileArchiveFile: (id) => ipcRenderer.invoke('create-project-file-archive-file', id),

  // File system utility
  instancePopupWindow: (label, title, urlPath) =>
    ipcRenderer.invoke('instance-popup-window', label, title, urlPath),
  identifyInternetConnection: () => ipcRenderer.invoke('identify-internet-connection'),
  showOkNotification: (message, kind) => ipcRenderer.invoke('show-ok-notification', message, kind),
  showAskNotification: (message, kind) =>
    ipcRenderer.invoke('show-ask-notification', message, kind),
  downloadFile: (url, filePath) => ipcRenderer.invoke('download-file', url, filePath),

  // Listeners IPC
  onDownloadProgress: (callback) =>
    ipcRenderer.on('download-progress', (_e, data) => callback(data)),
  removeDownloadProgressListener: (callback) =>
    ipcRenderer.removeListener('download-progress', callback),

  // Channeling
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, callback) => ipcRenderer.on(channel, (_event, data) => callback(data)),
  removeEventListener: (channel) => ipcRenderer.removeAllListeners(channel)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (err) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
