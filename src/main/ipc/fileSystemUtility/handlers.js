import { dialog, BrowserWindow } from 'electron';

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
