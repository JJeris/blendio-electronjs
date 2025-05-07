import { v4 as uuidv4 } from "uuid";
import { LaunchArgument } from "../../models";
import { launchArgumentRepo } from "../../db";

export async function insertLaunchArgument(_, argumentString, projectFileId = null, pythonScriptId = null) {
    try {
        const existing = launchArgumentRepo.fetch(null, null, argumentString);
        if (existing.length > 0) {
            const entry = existing[0];
            const now = new Date().toISOString();
            entry.accessed = now;
            entry.modified = now;
            launchArgumentRepo.update(entry);
            return entry.id;
        }

        const now = new Date().toISOString();
        const newEntry = new LaunchArgument({
            id: uuidv4(),
            is_default: false,
            argument_string: argumentString,
            last_used_project_file_id: projectFileId,
            last_used_python_script_id: pythonScriptId,
            created: now,
            modified: now,
            accessed: now
        });

        launchArgumentRepo.insert(newEntry);
        return newEntry.id;
    } catch (err) {
        console.error('insertLaunchArgument failed:', err);
        return '';
    }
}

export async function updateLaunchArgument(_, id, isDefault) {
    try {
        const results = launchArgumentRepo.fetch(id);
        if (results.length === 0) {
            return;
        }

        if (isDefault === true) {
            const entry = results[0];
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
        }
    } catch (err) {
        console.error('updateLaunchArgument failed:', err);
    }
}


export async function fetchLaunchArguments(_, id = null, limit = null, argumentString = null) {
    try {
        const results = launchArgumentRepo.fetch(id, limit, argumentString);
        results.sort((a, b) => b.accessed.localeCompare(a.accessed));
        return results;
    } catch (err) {
        console.error('fetchLaunchArguments failed:', err);
        return [];
    }
}


export async function deleteLaunchArgument(_, id) {
    try {
        launchArgumentRepo.remove(id);
    } catch (err) {
        console.error('deleteLaunchArgument failed:', err);
    }
}