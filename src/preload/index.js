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
        ipcRenderer.invoke('fetch-blender-version-installation-locations', id, limit, repoDirectoryPath),
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
        ipcRenderer.invoke('launch-blender-version-with-launch-args', id, launchArgumentsId, pythonScriptId),

    // Python Scripts
    insertPythonScript: () => ipcRenderer.invoke('insert-python-script'),
    fetchPythonScripts: (id = null, limit = null, scriptFilePath = null) => ipcRenderer.invoke('fetch-python-script', id, limit, scriptFilePath),
    deletePythonScript: (id) => ipcRenderer.invoke('delete-python-script', id),

    // Launch Arguments
    insertLaunchArgument: (argumentString, projectFileId = null, pythonScriptId = null) => ipcRenderer.invoke('insert-launch-argument', argumentString, projectFileId, pythonScriptId),
    updateLaunchArgument: (id, isDefault) => ipcRenderer.invoke('update-launch-argument', id, isDefault),
    fetchLaunchArguments: (id = null, limit = null, argumentString = null) => ipcRenderer.invoke('fetch-launch-arguments', id, limit, argumentString),
    deleteLaunchArgument: (id) => ipcRenderer.invoke('delete-launch-argument', id)
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    window.electron = electronAPI
    window.api = api
}
