import { v4 as uuidv4 } from "uuid";
import { LaunchArgument } from "../../models";
import { launchArgumentRepo } from "../../db";
import { showAskNotification, showOkNotification } from '../fileSystemUtility/handlers.js';

/**
 * ID: KP_001
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function insertLaunchArgument(_, argumentString, projectFileId = null, pythonScriptId = null) {
    try {
        const results = launchArgumentRepo.fetch(null, null, argumentString);
        if (results.length > 0) {
            const existingEntry = results[0];
            existingEntry.accessed = new Date().toISOString();
            existingEntry.modified = new Date().toISOString();
            launchArgumentRepo.update(existingEntry);
            return existingEntry.id;
        }
        const entry = new LaunchArgument({
            id: uuidv4(),
            is_default: false,
            argument_string: argumentString,
            last_used_project_file_id: projectFileId,
            last_used_python_script_id: pythonScriptId,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString()
        });
        launchArgumentRepo.insert(entry);
        return entry.id;
    } catch (err) {
        await showOkNotification(`Failed to insert launch argument: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: KP_002
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function updateLaunchArgument(_, id, isDefault) {
    try {
        const results = launchArgumentRepo.fetch(id);
        if (results.length === 0) {
            throw "Failed to fetch launch argument by ID";
        }
        const entry = results[0];
        if (isDefault === true) {
            entry.is_default = false;
            launchArgumentRepo.update(entry);
        } else {
            const entries = launchArgumentRepo.fetch();
            for (const entry of entries) {
                const newDefault = entry.id === id;
                if (entry.is_default !== newDefault) {
                    entry.is_default = newDefault;
                    launchArgumentRepo.update(entry);
                }
            }
            return;
        }
    } catch (err) {
        await showOkNotification(`Failed to update launch arguments: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: KP_003
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function fetchLaunchArguments(_, id = null, limit = null, argumentString = null) {
    try {
        const results = launchArgumentRepo.fetch(id, limit, argumentString);
        // Sort DESC
        results.sort((a, b) => b.accessed.localeCompare(a.accessed));
        return results;
    } catch (err) {
        await showOkNotification(`Failed to fetch launch arguments: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: KP_004
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function deleteLaunchArgument(_, id) {
    try {
        const confirmation = await showAskNotification("Are you sure you want to delete this launch argument entry?", "warning");
        if (confirmation === false) {
            return;
        }
        launchArgumentRepo.remove(id);
        return;
    } catch (err) {
        await showOkNotification(`Failed to delete launch argument: ${err}`, "error");
        throw err;
    }
}