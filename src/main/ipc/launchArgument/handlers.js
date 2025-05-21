import { v4 as uuidv4 } from "uuid";
import { LaunchArgument } from "../../models";
import { launchArgumentRepo } from "../../db";
import { showAskNotification, showOkNotification } from '../fileSystemUtility/handlers.js';

/**
 * ID: KP_001
 * Paskaidrojums:
 * ABC analīzes rezultāts:5,16,3
 */
export async function insertLaunchArgument(_, argumentString, projectFileId = null, pythonScriptId = null) {
    try { // C (3.d.) try
        let results = launchArgumentRepo.fetch(null, null, argumentString); // A (1.a.) let results =; B (2.a.) launchArgumentRepo.fetch()
        if (results.length > 0) { // C (3.a.) results.length === 0
            let existingEntry = results[0]; // A (1.a.) let existingEntry =;
            existingEntry.accessed = new Date().toISOString(); // A (1.a.) let existingEntry.modified =; B (2.b.) new Date(); B (2.a.) .toISOString()
            existingEntry.modified = new Date().toISOString(); // A (1.a.) let existingEntry.modified =; B (2.b.) new Date(); B (2.a.) .toISOString()
            launchArgumentRepo.update(existingEntry); // B (2.a.) launchArgumentRepo.update()
            return existingEntry.id; // B (2.c.) priekšlaicīgs return
        }
        let entry = new LaunchArgument({ // A (1.a.) let entry =; B (2.b.) new LaunchArgument;
            id: uuidv4(), // B (2.a.) uuidv4();
            is_default: false,
            argument_string: argumentString,
            last_used_project_file_id: projectFileId,
            last_used_python_script_id: pythonScriptId,
            created: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
            modified: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
            accessed: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
        });
        launchArgumentRepo.insert(entry); // B (2.a.) launchArgumentRepo.insert()
        return entry.id;
    } catch (err) { // C (3.d.) catch
        await showOkNotification(`Failed to insert launch argument: ${err}`, "error"); // B (2.a.) showOkNotification()
        throw err; // B (2.c.) throw
    }
}

/**
 * ID: KP_002
 * Paskaidrojums:
 * ABC analīzes rezultāts:7,7,7
 */
export async function updateLaunchArgument(_, id, isDefault) {
    try { // C (3.d.) try
        let results = launchArgumentRepo.fetch(id); // A (1.a.) let results =; B (2.a.) launchArgumentRepo.fetch()
        if (results.length === 0) { // C (3.a.) results.length === 0
            throw "Failed to fetch launch argument by ID"; // B (2.c.) throw
        }
        let entry = results[0]; // A (1.a.) let entry =
        if (isDefault === true) { // C (3.a.) isDefault === true
            entry.is_default = false; // A (1.a.) entry.is_default =
            launchArgumentRepo.update(entry); // B (2.a.) launchArgumentRepo.update()
        } else { // C (3.b.) else;
            let entries = launchArgumentRepo.fetch(); // A (1.a.) let entries =; B (2.a.) launchArgumentRepo.fetch()
            for (let entry of entries) { // A (1.a.) let entry
                let newDefault = entry.id === id; // A (1.a.) let newDefault =; C (3.a.) entry.id === id
                if (entry.is_default !== newDefault) { // C (3.a.) entry.is_default !== newDefault
                    entry.is_default = newDefault; // A (1.a.) entry.is_default =
                    launchArgumentRepo.update(entry); // B (2.a.) launchArgumentRepo.update()
                }
            }
            return;
        }
    } catch (err) { // C (3.d.) catch
        await showOkNotification(`Failed to update launch arguments: ${err}`, "error"); // B (2.a.) showOkNotification()
        throw err; // B (2.c.) throw
    }
}

/**
 * ID: KP_003
 * Paskaidrojums:
 * ABC analīzes rezultāts:2,5,2
 */
export async function fetchLaunchArguments(_, id = null, limit = null, argumentString = null) {
    try { // C (3.d.) try
        let results = launchArgumentRepo.fetch(id, limit, argumentString); // A (1.a.) let results =; B (2.a.) launchArgumentRepo.fetch()
        // Sort DESC
        results.sort((a, b) => b.accessed.localeCompare(a.accessed)); // A (1.e.) results.sort(); B (2.a.) (a, b) =>; B (2.a.) b.accessed.localeCompare(a.accessed)
        return results;
    } catch (err) { // C (3.d.) catch
        await showOkNotification(`Failed to fetch launch arguments: ${err}`, "error"); // B (2.a.) showOkNotification()
        throw err; // B (2.c.) throw
    }
}

/**
 * ID: KP_004
 * Paskaidrojums:
 * ABC analīzes rezultāts:1,5,3
 */
export async function deleteLaunchArgument(_, id) {
    try { // C (3.d.) try
        let confirmation = await showAskNotification("Are you sure you want to delete this launch argument entry?", "warning"); // A (1.a.) let confirmation =; B (2.a.) showAskNotification()
        if (confirmation === false) { // C (3.a.) confirmation == false
            return; // B (2.c.) priekšlaicīgs return
        }
        launchArgumentRepo.remove(id); // B (2.a.) launchArgumentRepo.remove()
        return;
    } catch (err) { // C (3.d.) catch
        await showOkNotification(`Failed to delete launch argument: ${err}`, "error"); // B (2.a.) showOkNotification()
        throw err; // B (2.c.) throw
    }
}