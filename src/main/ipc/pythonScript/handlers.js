import { v4 as uuidv4 } from 'uuid'
import { PythonScript } from '../../models/index.js';
import pythonScriptRepo from '../../db/pythonScriptRepo.js';
import { getFileFromFileExplorer } from '../fileSystemUtility/handlers.js';

// Saglabāt nesen izmantoto Python skripta faila lokāciju
export async function insertPythonScript(_) {
    try {
        const filePath = await getFileFromFileExplorer();
        if (!filePath) {
            // TODO return since the user didnt select anything.
            return { error: "" }
        }
        const existingScripts = pythonScriptRepo.fetch(null, null, filePath);
        if (existingScripts.length > 0) {
            const existing = existingScripts[0];
            existing.modified = new Date().toISOString();
            existing.accessed = new Date().toISOString();
            pythonScriptRepo.update(existing);
            return new PythonScript(existing);
        }
        const script = new PythonScript({
            id: uuidv4(),
            script_file_path: filePath,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            accessed: new Date().toISOString(),
        })
        pythonScriptRepo.insert(script);
        return script;
    } catch (err) {
        return null;
    }
}

export async function fetchPythonScripts(_, id = null, limit = null, scriptFilePath = null) {
    try {
        let results = pythonScriptRepo.fetch(id, limit, scriptFilePath);
        // Sort DESC
        results.sort((a, b) => b.accessed.localeCompare(a.accessed));
        return results;
    } catch (err) {
        return [];
    }
}

export async function deletePythonScript(_, id) {
    try {
        pythonScriptRepo.remove(id);
        return;
    } catch (err) {
        throw new Error('');
    }
}