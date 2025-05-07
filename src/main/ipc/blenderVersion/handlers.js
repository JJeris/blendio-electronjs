import { blenderRepoPathRepo, installedBlenderVersionRepo } from "../../db";
import { getFileFromFileExplorer } from "../fileSystemUtility/handlers";

/// Saglabāt Blender versiju lejupielādes/instalācijas lokāciju failu sistēmā.
export async function insertBlenderVersionInstallationLocation(_) {
    try {
        const repoDirectoryPath = await getFileFromFileExplorer();
        if (!repoDirectoryPath) {
            return { error: "" }
        }
        const existingScripts = blenderRepoPathRepo.fetch(null, null, repoDirectoryPath);
        if (existingScripts && existingScripts.length > 0) {
            return null;
        }
        const entry = {
            id: crypto.randomUUID(),
            repo_directory_path: repoDirectoryPath,
            is_default: false,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString(),
        };
        await blenderRepoPathRepo.insert(entry);
        return null;

    } catch (err) {
        console.error("Failed to insert Blender version installation location:", error);
        return { error: "Failed to insert location" };
    }
}

/// Atjaunināt Blender versiju lejupielādes/instalācijas lokāciju failu sistēmā.


/// Saņemt Blender versiju lejupielādes/instalācijas lokāciju failu sistēmā.


// Izdzēst Blender versiju lejupielādes/instalācijas lokāciju failu sistēmā.
export async function deleteBlenderVersionInstallatioLocation(_, id) {
    try {
        const blenderRepoPathList = blenderRepoPathRepo.fetch(id, null, null);
        if (blenderRepoPathList.length == 0) {
            return { error: "" }
        }
        let blenderRepoPathEntry = blenderRepoPathList[0];
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