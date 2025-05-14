import { v4 as uuidv4 } from "uuid";
import { blenderRepoPathRepo, installedBlenderVersionRepo, launchArgumentRepo, pythonScriptRepo } from "../../db";
import { BlenderRepoPath, InstalledBlenderVersion, LaunchArgument, PythonScript } from "../../models";
import { deleteDirectory, deleteFile, extractArchive, getDirectoryFromFileExplorer, getFileFromFileExplorer, launchExecutable } from "../fileSystemUtility/handlers";
import path from 'path';
import fs from 'fs';

export async function insertInstalledBlenderVersion(_, executableFilePath) {
    try {
        let parentDir = path.dirname(executableFilePath);
        if (!parentDir) {
            return { error: 'Invalid executable path' };
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
        return null;
    } catch (err) {
        console.error("Failed to insert Blender version:", err);
        return { error: "Failed to insert Blender version" };
    }
}

export async function insertAndRefreshInstalledBlenderVersions() {
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
                const result = insertInstalledBlenderVersion(null, launcherPath);
                if (result?.error) {
                    return result;
                }
            }
        }
        return null;
    } catch (err) {
        console.error('Failed to refresh installed Blender versions:', err);
        return { error: 'Refresh failed' };
    }
}

export async function updateInstalledBlenderVersion(_, id, isDefault) {
    try {
        const results = installedBlenderVersionRepo.fetch(id);
        if (results.length == 0) {
            return { error: "" }
        }

        const entry = new InstalledBlenderVersion(results[0]);
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
        }
    } catch (err) {
        console.error('updateInstalledBlenderVersion failed:', err);
    }
}

export async function fetchInstalledBenderVersions(_, id = null, limit = null, executableFilePath = null) {
    try {
        let results = installedBlenderVersionRepo.fetch(id, limit, executableFilePath);
        return results;
    } catch (error) {
        return [];
    }
}

export async function uninstallAndDeleteInstalledBlenderVersionData(_, id) {
    try {
        let installedBlenderVersionList = installedBlenderVersionRepo.fetch(id);
        if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
            return { error: "No Blender version found" };
        }
        const entry = new InstalledBlenderVersion(installedBlenderVersionList[0]);
        await deleteDirectory(entry.installation_directory_path);
        installedBlenderVersionRepo.remove(entry.id);
        return null;
    } catch (err) {
        console.error("Failed to delete Blender:", err);
        return { error: "Failed to delete Blender" };
    }
}

export async function launchBlenderVersionWithLaunchArgs(_, id, launchArgumentsId = null, pythonScriptId = null) {
    try {
        const installedBlenderVersionList = installedBlenderVersionRepo.fetch(id, null, null);
        if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
            return { error: "No Blender version found" };
        }
        const instance = new InstalledBlenderVersion(installedBlenderVersionList[0]);
        installedBlenderVersionRepo.update(instance);
        const finalLaunchArgs = [];

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
        await launchExecutable(instance.executable_file_path, finalLaunchArgs);
        return null;
    } catch (err) {
        console.error("Failed to launch Blender:", err);
        return { error: "Failed to launch Blender" };
    }
}
// Saglabāt lejupielādējamu Blender versiju datus
export async function getDownloadableBlenderVersionData(_) {
    try {
        const platform = process.platform; // win32, darwin, linux
        // const arch = process.arch;
        const response = await fetch("https://builder.blender.org/download/daily/?format=json&v=2");
        const data = await response.json();
        const filteredData = data.filter(p => {
            // What if win64
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
        console.error("Failed to fetch Blender versions:", err);
        return { error: "Failed to fetch data" };
    }
}

// Lejupielādēt un instalēt Blender versiju
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
        installedBlenderVersionRepo.insert(entry);
        return null;
    } catch (err) {
        console.error("Failed to install Blender version:", err);
        return { error: "Failed to install Blender version." };
    }
}

// Saglabāt Blender versiju lejupielādes/instalācijas lokāciju failu sistēmā.
export async function insertBlenderVersionInstallationLocation() {
    try {
        const repoDirectoryPath = await getDirectoryFromFileExplorer();
        if (!repoDirectoryPath) {
            return null;
        }
        const existingScripts = blenderRepoPathRepo.fetch(null, null, repoDirectoryPath);
        if (existingScripts && existingScripts.length > 0) {
            return null;
        }
        const entry = new BlenderRepoPath({
            id: crypto.randomUUID(),
            repo_directory_path: repoDirectoryPath,
            is_default: false,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString(),
        });
        blenderRepoPathRepo.insert(entry);
        return null;
    } catch (err) {
        console.error("Failed to insert Blender version installation location:", err);
        return { error: "Failed to insert location" };
    }
}

// Atjaunināt Blender versiju lejupielādes/instalācijas lokāciju failu sistēmā.
export async function updateBlenderVersionInstallationLocation(_, id, isDefault) {
    try {
        const results = blenderRepoPathRepo.fetch(id);
        if (results.length == 0) {
            return { error: "" }
        }
        const entry = new BlenderRepoPath(results[0]);
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
        }
    } catch (err) {
        console.error('updateLaunchArgument failed:', err);
    }
}

// Saņemt Blender versiju lejupielādes/instalācijas lokāciju failu sistēmā.
export async function fetchBlenderVersionInstallationLocations(_, id = null, limit = null, repoDirectoryPath = null) {
    try {
        let results = blenderRepoPathRepo.fetch(id, limit, repoDirectoryPath);
        return results;
    } catch (err) {
        return [];
    }
}

// Izdzēst Blender versiju lejupielādes/instalācijas lokāciju failu sistēmā.
export async function deleteBlenderVersionInstallationLocation(_, id) {
    try {
        const blenderRepoPathList = blenderRepoPathRepo.fetch(id, null, null);
        if (blenderRepoPathList.length == 0) {
            return { error: "" }
        }
        let blenderRepoPathEntry = new BlenderRepoPath(blenderRepoPathList[0]);
        const installedBlenderVersionList = installedBlenderVersionRepo.fetch(id, null, null);
        for (const version in installedBlenderVersionList) {
            if (version.installation_directory_path && version.installation_directory_path.startsWith(blenderRepoPathEntry.repo_directory_path)) {
                installedBlenderVersionRepo.remove(version.id);
            }
        }
        blenderRepoPathRepo.remove(id);
        return null;
    } catch (err) {
        console.error("Failed to delete Blender version installation location:", err);
        return { error: "Failed to delete Blender installation location." };
    }
}