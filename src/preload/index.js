import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer.
const api = {
    fetchRepoPaths: (id = null, limit = null) => ipcRenderer.invoke('repo-fetch', id, limit),
    insertRepoPath: (repo) => ipcRenderer.invoke('repo-insert', repo),
    updateRepoPath: (repo) => ipcRenderer.invoke('repo-update', repo),
    deleteRepoPath: (id) => ipcRenderer.invoke('repo-remove', id),
    
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
