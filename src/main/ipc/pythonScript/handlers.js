/* eslint-disable no-unused-vars */
import { v4 as uuidv4 } from 'uuid'
import { PythonScript } from '../../models/index.js';
import pythonScriptRepo from '../../db/pythonScriptRepo.js';
import { getFileFromFileExplorer, showAskNotification, showOkNotification } from '../fileSystemUtility/handlers.js';

/**
 * ID: PS_001
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function insertPythonScript(_) {
    try {
        const filePath = await getFileFromFileExplorer();
        if (!filePath) {
            return null;
        }
        const results = pythonScriptRepo.fetch(null, null, filePath);
        if (results.length > 0) {
            const  existingEntry = results[0];
            existingEntry.modified = new Date().toISOString();
            existingEntry.accessed = new Date().toISOString();
            pythonScriptRepo.update(existingEntry);
            return existingEntry;
        }
        const entry = new PythonScript({
            id: uuidv4(),
            script_file_path: filePath,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString(),
        })
        pythonScriptRepo.insert(entry);
        return entry;
    } catch (err) {
        await showOkNotification(`Failed to insert python script: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: PS_002
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function fetchPythonScripts(_, id = null, limit = null, scriptFilePath = null) {
    try {
        let results = pythonScriptRepo.fetch(id, limit, scriptFilePath);
        // Sort DESC
        results.sort((a, b) => b.accessed.localeCompare(a.accessed));
        return results;
    } catch (err) {
        await showOkNotification(`Failed to fetch python scripts: ${err}`, "error");
        throw err;
    }
}

/**
 * ID: PS_003
 * Paskaidrojums:
 * ABC analīzes rezultāts:
 */
export async function deletePythonScript(_, id) {
    try {
        const confirmation = await showAskNotification("Are you sure you want to delete this python script entry?", "warning");
        if (confirmation === false) {
            return;
        }
        pythonScriptRepo.remove(id);
        return;
    } catch (err) {
        await showOkNotification(`Failed to delete python script: ${err}`, "error");
        throw err;
    }
}