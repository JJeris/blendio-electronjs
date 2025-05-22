/* eslint-disable no-unused-vars */
import { v4 as uuidv4 } from 'uuid'
import { PythonScript } from '../../models/index.js'
import pythonScriptRepo from '../../db/pythonScriptRepo.js'
import {
  getFileFromFileExplorer,
  showAskNotification,
  showOkNotification
} from '../fileSystemUtility/handlers.js'

/**
 * ID: PS_001
 * Paskaidrojums:
 * ABC analīzes rezultāts:6,20,4
 */
export async function insertPythonScript(_) {
  try {
    // C (3.d.) try
    let filePath = await getFileFromFileExplorer() // A (1.a.) let filePath =; B (2.a.) getFileFromFileExplorer()
    if (!filePath) {
      // C (3.a.) filePath != truthy
      return null // B (2.c.) priekšlaicīgs return
    }
    let results = pythonScriptRepo.fetch(null, null, filePath) // A (1.a.) let results =; B (2.a.) pythonScriptRepo.fetch()
    if (results.length > 0) {
      // C (3.a.) results.length > 0
      let existingEntry = results[0] // A (1.a.) let existingEntry =;
      existingEntry.modified = new Date().toISOString() // A (1.a.) let existingEntry.modified =; B (2.b.) new Date(); B (2.a.) .toISOString()
      existingEntry.accessed = new Date().toISOString() // A (1.a.) let existingEntry.accessed =; B (2.b.) new Date(); B (2.a.) .toISOString()
      pythonScriptRepo.update(existingEntry) // B (2.a.) pythonScriptRepo.update()
      return existingEntry // B (2.c.) priekšlaicīgs return
    }
    let entry = new PythonScript({
      // A (1.a.) let entry.accessed =; B (2.b.) new PythonScript;
      id: uuidv4(), // B (2.a.) uuidv4();
      script_file_path: filePath,
      created: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      modified: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      accessed: new Date().toISOString() // B (2.b.) new Date(); B (2.a.) .toISOString()
    })
    pythonScriptRepo.insert(entry) // B (2.a.) pythonScriptRepo.insert()
    return entry
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to insert python script: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PS_002
 * Paskaidrojums:
 * ABC analīzes rezultāts:2,5,2
 */
export async function fetchPythonScripts(_, id = null, limit = null, scriptFilePath = null) {
  try {
    // C (3.d.) try
    let results = pythonScriptRepo.fetch(id, limit, scriptFilePath) // A (1.a.) let results =; B (2.a.) pythonScriptRepo.fetch()
    // Sort DESC
    results.sort((a, b) => b.accessed.localeCompare(a.accessed)) // A (1.e.) results.sort(); B (2.a.) (a, b) =>; B (2.a.) b.accessed.localeCompare(a.accessed)
    return results
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to fetch python scripts: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PS_003
 * Paskaidrojums:
 * ABC analīzes rezultāts:1,5,3
 */
export async function deletePythonScript(_, id) {
  try {
    // C (3.d.) try
    let confirmation = await showAskNotification(
      'Are you sure you want to delete this python script entry?',
      'warning'
    ) // A (1.a.) let confirmation =; B (2.a.) showAskNotification()
    if (confirmation === false) {
      // C (3.a.) confirmation == false
      return //B (2.c.) priekšlaicīgs return
    }
    pythonScriptRepo.remove(id) // B (2.a.) pythonScriptRepo.remove()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to delete python script: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}
