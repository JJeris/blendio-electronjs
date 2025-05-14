import { v4 as uuidv4 } from "uuid";
import path from 'path';
import { InstalledBlenderVersion, LaunchArgument, ProjectFile, PythonScript } from "../../models";
import { installedBlenderVersionRepo, launchArgumentRepo, projectFileRepo, pythonScriptRepo } from "../../db";
import { archiveFile, deleteFile, getDirectoryFromFileExplorer, launchExecutable, openInFileExplorer } from "../fileSystemUtility/handlers";
import fs from 'fs';
import os from 'os';
 import { IMPORT_BPY, SAVE_AS_MAINFILE } from "./consts";

export async function insertBlendFile(_, filePath) {
    try {
        const entry = new ProjectFile({
            id: uuidv4(),
            file_path: filePath,
            file_name: path.basename(filePath),
            associated_series_json: '[]',
            last_used_blender_version_id: null,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString()
        });
        projectFileRepo.insert(entry);
        return null;
    } catch (err) {
        console.error("Failed to insert Project file:", err);
        return { error: "Failed to insert Project file" };
    }
}

// export async function updateBlendFile(_, id, associatedSeries, lastUsedBlenderVersionId) {
//     try {
//         return null;
//     } catch (err) {
//         console.error('updateBlendFile failed:', err);
//     }
// }

export async function insertAndRefreshBlendFiles(_) {
    try {
        const home = os.homedir();
        const platform = os.platform();
        let configDirectory = null;
        if (platform === 'win32') {
            configDirectory = path.join(home, 'AppData', 'Roaming'); // Windows
        } else if (platform === 'darwin') {
            configDirectory = path.join(home, 'Library', 'Application Support'); // macOS
        } else {
            configDirectory = path.join(home, '.config'); // Linux and other UNIX-like
        }
        const blenderFoundationDirectory = path.join(configDirectory, 'Blender Foundation', 'Blender');
        const directoryEntries = fs.readdirSync(blenderFoundationDirectory, { withFileTypes: true }).filter(entry => entry.isDirectory());
        for (const entry of directoryEntries) {
            const seriesName = entry.name;
            const recentFilesTxtPath = path.join(blenderFoundationDirectory, seriesName, 'config', 'recent-files.txt');
            if (!fs.existsSync(recentFilesTxtPath)) {
                continue;
            }
            const recentFilesTxtContent = fs.readFileSync(recentFilesTxtPath, 'utf-8');
            let refreshedRecentFilesTxtContent = "";
            for (const line of recentFilesTxtContent.split(/\r?\n/)) {
                const filePath = line.trim();
                if (filePath.length === 0) {
                    continue;
                }
                if (!fs.existsSync(filePath)) {
                    const currentEntries = projectFileRepo.fetch(null, null, filePath);
                    if (currentEntries && currentEntries.length > 0) {
                        let entryToRemove = new ProjectFile(currentEntries[0]);
                        await projectFileRepo.remove(entryToRemove.id);
                    }
                    continue;
                } else {
                    refreshedRecentFilesTxtContent += filePath;
                    refreshedRecentFilesTxtContent += "\n"
                }
                const existingEntries = projectFileRepo.fetch(null, null, filePath);
                if (existingEntries.length === 0) {
                    let newProjectFileEntry = new ProjectFile({
                        id: uuidv4(),
                        file_path: filePath,
                        file_name: path.basename(filePath),
                        associated_series_json: JSON.stringify([seriesName]),
                        last_used_blender_version_id: null,
                        created: new Date().toISOString(),
                        modified: new Date().toISOString(),
                        accessed: new Date().toISOString()
                    });
                    projectFileRepo.insert(newProjectFileEntry);
                } else {
                    let existingEntry = new ProjectFile(existingEntries[0]);
                    let associatedSeriesJson = JSON.parse(existingEntry.associated_series_json);
                    if (!associatedSeriesJson.includes(seriesName)) {
                        associatedSeriesJson.push(seriesName);
                        associatedSeriesJson.sort();
                        existingEntry.associated_series_json = JSON.stringify(associatedSeriesJson);
                        projectFileRepo.update(existingEntry);
                    }
                }
            }
            fs.writeFileSync(recentFilesTxtPath, refreshedRecentFilesTxtContent);
        }
        return null;
    } catch (err) {
        console.error("insertAndRefreshBlendFiles failed:", err);
        return { error: "Failed to refresh recent .blend files" };
    }
}

export async function fetchBlendFiles(_, id = null, limit = null, filePath = null) {
    try {
        let results = projectFileRepo.fetch(id, limit, filePath);
        return results;
    } catch (err) {
        return [];
    }
}

export async function deleteBlendFile(_, id) {
    try {
        let projectFileList = projectFileRepo.fetch(id);
        if (!projectFileList || projectFileList.length === 0) {
            return { error: "No Project file found" };
        }
        const entry = new ProjectFile(projectFileList[0]);
        await deleteFile(entry.file_path);
        projectFileRepo.remove(entry.id);
        return null;
    } catch (err) {
        console.error("Failed to delete Project file:", err);
        return { error: "Failed to delete Project file" };
    }
}

export async function openBlendFile(_, id, installedBlenderVersionId, launchArgumentsId = null, pythonScriptId = null) {
    try {
        const projectFileList = projectFileRepo.fetch(id, null, null);
        if (!projectFileList || projectFileList.length === 0) {
            return { error: "Project file not found" };
        }
        const projectFile = new ProjectFile(projectFileList[0]);
        projectFile.last_used_blender_version_id = installedBlenderVersionId;
        projectFileRepo.update(projectFile);
        const installedBlenderVersionList = installedBlenderVersionRepo.fetch(installedBlenderVersionId, null, null);
        if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
            return { error: "Blender version not found" };
        }
        const blenderVersion = new InstalledBlenderVersion(installedBlenderVersionList[0]);
        installedBlenderVersionRepo.update(blenderVersion);
        let finalLaunchArgs = [projectFile.file_path];
        if (launchArgumentsId != null) {
            const launchArgumentList = launchArgumentRepo.fetch(launchArgumentsId, null, null);
            if (!launchArgumentList || launchArgumentList.length === 0) {
                return { error: "Launch arguments not found" };
            }
            const argEntry = new LaunchArgument(launchArgumentList[0]);
            launchArgumentRepo.update(argEntry);
            const parsedArgs = argEntry.argument_string.trim().split(/\s+/);
            finalLaunchArgs.push(...parsedArgs);
        }
        if (pythonScriptId != null) {
            const pythonScriptList = pythonScriptRepo.fetch(pythonScriptId, null, null);
            if (!pythonScriptList || pythonScriptList.length === 0) {
                return { error: "Python script not found" };
            }
            const scriptEntry = new PythonScript(pythonScriptList[0]);
            pythonScriptRepo.update(scriptEntry);
            if (!finalLaunchArgs.includes("--python")) {
                finalLaunchArgs.push("--python", scriptEntry.script_file_path);
            } else {
                finalLaunchArgs.push(scriptEntry.script_file_path);
            }
        }
        await launchExecutable(blenderVersion.executable_file_path, finalLaunchArgs);
        console.log("FINISHED");
        return null;
    } catch (err) {
        console.error("Failed to open .blend file:", err);
        return { error: "Failed to open .blend file" };
    }
}

export async function createNewProjectFile(_, installedBlenderVersionId, fileName) {
    try {
        const directoryPath = await getDirectoryFromFileExplorer();
        if (!directoryPath) {
            return null; // User cancelled dialog or no path selected
        }
        if (!fileName.endsWith('.blend')) {
            fileName = `${fileName}.blend`;
        }
        const fullFilePath = path.join(directoryPath, fileName);
        const pythonCodeExpression = 
`
${IMPORT_BPY}
blend_file_path=r"${fullFilePath}"
${SAVE_AS_MAINFILE}
`;
        let installedBlenderVersionList = installedBlenderVersionRepo.fetch(installedBlenderVersionId, null, null);
        if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
            return { error: "Blender version not found" };
        }
        let entry = new InstalledBlenderVersion(installedBlenderVersionList[0]);
        await launchExecutable(entry.executable_file_path, ["--background", "--python-expr", pythonCodeExpression]);
        await insertBlendFile(null, fullFilePath);
        return null;
    } catch (err) {
        console.error("Failed to create new .blend file:", err);
        return { error: "Failed to create new .blend file" };
    }
}

export async function revealProjectFileInLocalFileSystem(_, id) {
    try {
        let projectFileList = projectFileRepo.fetch(id);
        if (!projectFileList || projectFileList.length === 0) {
            return { error: "No Project file found" };
        }
        const entry = new ProjectFile(projectFileList[0]);
        await openInFileExplorer(entry.file_path);
        return null;
    } catch (err) {
        console.error("Failed to reveal Project file:", err);
        return { error: "Failed to reveal Project file" };
    }
}

export async function createProjectFileArchiveFile(_, id) {
    try {
        const entryList = projectFileRepo.fetch(id, null, null);
        if (!entryList || entryList.length === 0) {
            return { error: "Project file not found" };
        }
        const entry = new ProjectFile(entryList[0]);
        const archivePath = await archiveFile(entry.file_path);
        await openInFileExplorer(archivePath);
        return null;
    } catch (err) {
        console.error("Failed to create archive file:", err);
        return { error: "Failed to create archive file" };
    }
}
