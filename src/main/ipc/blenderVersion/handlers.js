/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { v4 as uuidv4 } from "uuid";
import { blenderRepoPathRepo, installedBlenderVersionRepo, launchArgumentRepo, pythonScriptRepo } from "../../db";
import { BlenderRepoPath, InstalledBlenderVersion } from "../../models";
import { deleteDirectory, deleteFile, extractArchive, getDirectoryFromFileExplorer, launchExecutable } from "../fileSystemUtility/handlers";
import path from 'path';
import fs from 'fs';
import { showAskNotification, showOkNotification } from '../fileSystemUtility/handlers.js';

/**
 * ID: BV_001
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function insertInstalledBlenderVersion(_, executableFilePath) {
    try {
        let parentDir = path.dirname(executableFilePath);
        if (!parentDir) {
            throw "Failed to get file path parent";
        }
        const dirName = path.basename(parentDir);
        const regex = /blender-(\d+\.\d+(?:\.\d+)?)-([^\-+]+)/;
        const match = dirName.match(regex);
        const version = match?.[1] ?? '';
        const variantType = match?.[2] ?? ''
        const entry = new InstalledBlenderVersion({
            id: uuidv4(),
            version,
            variant_type: variantType,
            download_url: null,
            is_default: false,
            installation_directory_path: parentDir,
            executable_file_path: executableFilePath,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString(),
        });
        installedBlenderVersionRepo.insert(entry);
        return;
    } catch (err) {
        await showOkNotification(`Failed to insert installed Blender version: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_002
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function insertAndRefreshInstalledBlenderVersions(_) {
    try {
        const blenderRepoPaths = blenderRepoPathRepo.fetch(null, null, null);
        for (const repoPath of blenderRepoPaths) {
            const entries = fs.readdirSync(repoPath.repo_directory_path, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory()) {
                    continue;
                }
                const launcherPath = path.join(repoPath.repo_directory_path, entry.name, "blender-launcher.exe");
                if (!fs.existsSync(launcherPath)) {
                    continue;
                }
                const existingEntries = installedBlenderVersionRepo.fetch(null, null, launcherPath);
                if (existingEntries.length > 0) {
                    continue;
                }
                await insertInstalledBlenderVersion(null, launcherPath);
            }
        }
        const currentEntries = installedBlenderVersionRepo.fetch(null, null, null);
        for (const entry of currentEntries) {
            if (!fs.existsSync(entry.executable_file_path)) {
                installedBlenderVersionRepo.remove(entry.id);
            }
        }
        return;
    } catch (err) {
        await showOkNotification(`Failed to insert and refresh installed Blender version: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_003
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function updateInstalledBlenderVersion(_, id, isDefault) {
    try {
        const results = installedBlenderVersionRepo.fetch(id);
        if (results.length == 0) {
            throw "Failed to fetch installed Blender version by ID";
        }
        const entry = results[0];
        if (isDefault === true) {
            entry.is_default = false;
            installedBlenderVersionRepo.update(entry);
        } else {
            const entries = installedBlenderVersionRepo.fetch();
            for (const entry of entries) {
                const newDefault = entry.id === id;
                if (entry.is_default !== newDefault) {
                    entry.is_default = newDefault;
                    installedBlenderVersionRepo.update(entry);
                }
            }
            return;
        }
    } catch (err) {
        await showOkNotification(`Failed to update installed Blender versions: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_004
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function fetchInstalledBlenderVersions(_, id = null, limit = null, executableFilePath = null) {
    try {
        let results = installedBlenderVersionRepo.fetch(id, limit, executableFilePath);
        // Sort DESC
        results.sort((a, b) => b.version.localeCompare(a.version));
        return results;
    } catch (err) {
        await showOkNotification(`Failed to fetch installed Blender versions: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_005
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function uninstallAndDeleteInstalledBlenderVersionData(_, id) {
    try {
        const confirmation = await showAskNotification("Are you sure you want to delete this installed Blender version?", "warning");
        if (confirmation === false) {
            return;
        }
        let installedBlenderVersionList = installedBlenderVersionRepo.fetch(id);
        if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
            throw "Failed to fetch installed Blender version by ID";
        }
        const entry = installedBlenderVersionList[0];
        await deleteDirectory(entry.installation_directory_path);
        installedBlenderVersionRepo.remove(entry.id);
        return;
    } catch (err) {
        await showOkNotification(`Failed to delete installed Blender version: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_006
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function launchBlenderVersionWithLaunchArgs(_, id, launchArgumentsId = null, pythonScriptId = null) {
    try {
        const installedBlenderVersionList = installedBlenderVersionRepo.fetch(id, null, null);
        if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
            throw "Failed to fetch installed Blender version by ID";
        }
        const instance = installedBlenderVersionList[0];
        installedBlenderVersionRepo.update(instance);
        const finalLaunchArgs = [];
        if (launchArgumentsId != null) {
            const launchArgumentList = launchArgumentRepo.fetch(launchArgumentsId, null, null);
            if (!launchArgumentList || launchArgumentList.length === 0) {
                throw "Failed to fetch launch argument by ID"
            }
            const argEntry = launchArgumentList[0];
            launchArgumentRepo.update(argEntry);
            const parsedArgs = argEntry.argument_string.trim().split(/\s+/);
            finalLaunchArgs.push(...parsedArgs);
        }
        if (pythonScriptId != null) {
            const pythonScriptList = pythonScriptRepo.fetch(pythonScriptId, null, null);
            if (!pythonScriptList || pythonScriptList.length === 0) {
                throw "Failed to fetch python script by ID"
            }
            const scriptEntry = pythonScriptList[0];
            pythonScriptRepo.update(scriptEntry);
            if (!finalLaunchArgs.includes("--python")) {
                finalLaunchArgs.push("--python", scriptEntry.script_file_path);
            } else {
                finalLaunchArgs.push(scriptEntry.script_file_path);
            }
        }
        await launchExecutable(instance.executable_file_path, finalLaunchArgs);
        return;
    } catch (err) {
        console.log("aaa")
        await showOkNotification(`Failed to launch installed Blender version: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_007
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function getDownloadableBlenderVersionData(_) {
    try {
        const platform = process.platform; // win32, darwin, linux
        const response = await fetch("https://builder.blender.org/download/daily/?format=json&v=2");
        const responseJson = await response.json();
        const filteredData = responseJson.filter(p => {
            if (platform === "win32") {
                return p.bitness === 64 &&
                    p.platform === "windows" &&
                    p.architecture === "amd64" &&
                    p.file_extension === "zip"
            }
            if (platform === "darwin") {
                return p.bitness === 64 &&
                    p.platform === 'darwin' &&
                    p.architecture === 'arm64' &&
                    p.file_extension === 'dmg';
            }
            if (platform === "linux") {
                return p.bitness === 64 &&
                    p.platform === 'linux' &&
                    p.architecture === 'x86_64' &&
                    p.file_extension === 'xz';
            }
            return false
        });
        return filteredData;
    } catch (err) {
        await showOkNotification(`Failed to fetch downloadable Blender versions: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_008
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function downloadAndInstallBlenderVersion(_, archiveFilePath, downloadableBlenderVersion) {
    try {
        let entry = new InstalledBlenderVersion({
            id: uuidv4(),
            version: downloadableBlenderVersion.version,
            variant_type: downloadableBlenderVersion.release_cycle,
            download_url: downloadableBlenderVersion.url,
            is_default: false,
            installation_directory_path: "",
            executable_file_path: "",
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString()
        });
        let installationDirectoryPath = await extractArchive(archiveFilePath);
        entry.installation_directory_path = installationDirectoryPath;
        entry.executable_file_path = path.join(installationDirectoryPath, "blender-launcher.exe");
        await deleteFile(archiveFilePath);
        const existingEntries = installedBlenderVersionRepo.fetch(null, null, entry.executable_file_path);
        if (!existingEntries || existingEntries.length === 0) {
            installedBlenderVersionRepo.insert(entry);
            return;
        } else {
            const oldEntry = existingEntries[0];
            oldEntry.version = entry.version;
            oldEntry.variant_type = entry.variant_type;
            oldEntry.download_url = entry.download_url;
            oldEntry.is_default = entry.is_default;
            oldEntry.installation_directory_path = entry.installation_directory_path;
            oldEntry.executable_file_path = entry.executable_file_path;
            oldEntry.created = new Date().toISOString();
            oldEntry.modified = new Date().toISOString();
            oldEntry.accessed = new Date().toISOString();
            installedBlenderVersionRepo.update(oldEntry);
            return;
        }
    } catch (err) {
        await showOkNotification(`Failed to insert installed Blender version: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_009
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function insertBlenderVersionInstallationLocation() {
    try {
        const repoDirectoryPath = await getDirectoryFromFileExplorer();
        if (!repoDirectoryPath) {
            return;
        }
        const results = blenderRepoPathRepo.fetch(null, null, repoDirectoryPath);
        if (results && results.length > 0) {
            return;
        }
        const entry = new BlenderRepoPath({
            id: uuidv4(),
            repo_directory_path: repoDirectoryPath,
            is_default: false,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString(),
        });
        blenderRepoPathRepo.insert(entry);
        return;
    } catch (err) {
        await showOkNotification(`Failed to insert Blender repo path: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_010
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function updateBlenderVersionInstallationLocation(_, id, isDefault) {
    try {
        const results = blenderRepoPathRepo.fetch(id);
        if (results.length == 0) {
            throw "Failed to fetch Blender repo paths by ID";
        }
        const entry = results[0];
        if (isDefault === true) {
            entry.is_default = false;
            blenderRepoPathRepo.update(entry);
        } else {
            const entries = blenderRepoPathRepo.fetch();
            for (const entry of entries) {
                const newDefault = entry.id === id;
                if (entry.is_default !== newDefault) {
                    entry.is_default = newDefault;
                    blenderRepoPathRepo.update(entry);
                }
            }
            return;
        }
    } catch (err) {
        await showOkNotification(`Failed to update Blender repo path: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_011
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function fetchBlenderVersionInstallationLocations(_, id = null, limit = null, repoDirectoryPath = null) {
    try {
        let results = blenderRepoPathRepo.fetch(id, limit, repoDirectoryPath);
        return results;
    } catch (err) {
        await showOkNotification(`Failed to fetch Blender repo paths: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: BV_012
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function deleteBlenderVersionInstallationLocation(_, id) {
    try {
        const confirmation = await showAskNotification("Are you sure you want to delete this Blender installation location?", "warning");
        if (confirmation === false) {
            return;
        }
        const blenderRepoPathList = blenderRepoPathRepo.fetch(id, null, null);
        if (blenderRepoPathList.length == 0) {
            throw "Failed to fetch Blender repo paths by ID";
        }
        let blenderRepoPathEntry = blenderRepoPathList[0];
        const installedBlenderVersionList = installedBlenderVersionRepo.fetch(null, null, null);
        for (const version of installedBlenderVersionList) {
            if (version.installation_directory_path && version.installation_directory_path.startsWith(blenderRepoPathEntry.repo_directory_path)) {
                installedBlenderVersionRepo.remove(version.id);
            }
        }
        blenderRepoPathRepo.remove(id);
        return;
    } catch (err) {
        await showOkNotification(`Failed to delete Blender repo path entry: ${err}`, "error");
        throw err;
    }
}