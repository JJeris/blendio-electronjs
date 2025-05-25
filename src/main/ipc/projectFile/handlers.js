/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { ProjectFile } from '../../models'
import {
  installedBlenderVersionRepo,
  launchArgumentRepo,
  projectFileRepo,
  pythonScriptRepo
} from '../../db'
import {
  archiveFile,
  deleteFile,
  getDirectoryFromFileExplorer,
  launchExecutable,
  openInFileExplorer,
  showAskNotification,
  showOkNotification
} from '../fileSystemUtility/handlers'
import fs from 'fs'
import os from 'os'
import { IMPORT_BPY, SAVE_AS_MAINFILE } from './consts'

/**
 * ID: PF_001
 * ABC analīzes rezultāts:1,12,2
 */
export async function insertBlendFile(_, filePath) {
  try {
    // C (3.d.) try
    let entry = new ProjectFile({
      // A (1.a.) let entry =; B (2.b.) new ProjectFile;
      id: uuidv4(), // B (2.a.) uuidv4();
      file_path: filePath,
      file_name: path.basename(filePath), // B (2.a.) .basename()
      associated_series_json: '[]',
      last_used_blender_version_id: null,
      created: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      modified: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      accessed: new Date().toISOString() // B (2.b.) new Date(); B (2.a.) .toISOString()
    })
    projectFileRepo.insert(entry) // B (2.a.) .insert()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to insert project file: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PF_002
 * ABC analīzes rezultāts:26,42,16
 */
export async function insertAndRefreshBlendFiles(_) {
  try {
    // C (3.d.) try
    let home = os.homedir() // A (1.a.) let home =; B (2.a.) .homedir()
    let platform = os.platform() // A (1.a.) let platform =; B (2.a.) .platform()
    let configDirectory = null // A (1.a.) let configDirectory =;
    if (platform === 'win32') {
      // C (3.a.) platform === 'win32'
      configDirectory = path.join(home, 'AppData', 'Roaming') // A (1.a.) configDirectory =; B (2.a.) .join()
    } else if (platform === 'darwin') {
      // C (3.b.) else; C (3.a.) platform === 'darwin'
      configDirectory = path.join(home, 'Library', 'Application Support') // A (1.a.) configDirectory =; B (2.a.) .join()
    } else {
      // C (3.b.) else
      configDirectory = path.join(home, '.config') // A (1.a.) configDirectory =; B (2.a.) .join()
    }
    let blenderFoundationDirectory = path.join(configDirectory, 'Blender Foundation', 'Blender') // A (1.a.) let blenderFoundationDirectory =; B (2.a.) .join()
    let directoryEntries = fs
      .readdirSync(blenderFoundationDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory()) // A (1.a.) let directoryEntries =; B (2.a.) .readdirSync()
    for (let entry of directoryEntries) {
      // A (1.a.) let entry =;
      let seriesName = entry.name // A (1.a.) let seriesName =;
      let recentFilesTxtPath = path.join(
        blenderFoundationDirectory,
        seriesName,
        'config',
        'recent-files.txt'
      ) // A (1.a.) let recentFilesTxtPath =; B (2.a.) .join()
      if (!fs.existsSync(recentFilesTxtPath)) {
        // C (3.a.) fs.existsSync() != true; B (2.a.) .existsSync()
        continue // B (2.c.) continue
      }
      let recentFilesTxtContent = fs.readFileSync(recentFilesTxtPath, 'utf-8') // A (1.a.) let recentFilesTxtContent =; B (2.a.) .readFileSync()
      let refreshedRecentFilesTxtContent = '' // A (1.a.) let refreshedRecentFilesTxtContent =;
      for (let line of recentFilesTxtContent.split(/\r?\n/)) {
        // A (1.a.) let line =; B (2.a.) .split()
        let filePath = line.trim() // A (1.a.) let filePath =; B (2.a.) .trim()
        if (filePath.length === 0) {
          // C (3.a.) filePath.length === 0
          continue // B (2.c.) continue
        }
        if (!fs.existsSync(filePath)) {
          // C (3.a.) fs.existsSync() != true; B (2.a.) .existsSync()
          let currentEntries = projectFileRepo.fetch(null, null, filePath) // A (1.a.) let currentEntries =; B (2.a.) projectFileRepo.fetch()
          if (currentEntries && currentEntries.length > 0) {
            // C (3.a.) currentEntries == truthy; C (3.a.) currentEntries.length > 0
            let entryToRemove = currentEntries[0] // A (1.a.) let entryToRemove =;
            projectFileRepo.remove(entryToRemove.id) // B (2.a.) projectFileRepo.remove()
          }
          continue // B (2.c.) continue
        } else {
          // C (3.b.) else
          refreshedRecentFilesTxtContent += filePath // A (1.a.) refreshedRecentFilesTxtContent +=
          refreshedRecentFilesTxtContent += '\n' // A (1.a.) refreshedRecentFilesTxtContent +=
        }
        let existingEntries = projectFileRepo.fetch(null, null, filePath) // A (1.a.) let existingEntries =; B (2.a.) projectFileRepo.fetch()
        if (existingEntries.length === 0) {
          // C (3.a.) existingEntries.length === 0
          let newProjectFileEntry = new ProjectFile({
            // A (1.a.) let newProjectFileEntry =; B (2.b.) new ProjectFile;
            id: uuidv4(), // B (2.a.) uuidv4();
            file_path: filePath,
            file_name: path.basename(filePath), // B (2.a.) .basename()
            associated_series_json: JSON.stringify([seriesName]), // B (2.a.) .stringify()
            last_used_blender_version_id: null,
            created: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
            modified: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
            accessed: new Date().toISOString() // B (2.b.) new Date(); B (2.a.) .toISOString()
          })
          projectFileRepo.insert(newProjectFileEntry) // B (2.b.) projectFileRepo.insert()
        } else {
          // C (3.b.) else
          let existingEntry = existingEntries[0] // A (1.a.) let existingEntry =;
          let associatedSeriesJson = JSON.parse(existingEntry.associated_series_json) // A (1.a.) let associatedSeriesJson =; B (2.a.) .parse()
          if (!associatedSeriesJson.includes(seriesName)) {
            // C (3.a.) associatedSeriesJson.includes() != true;  B (2.a.) .includes()
            associatedSeriesJson.push(seriesName) // B (2.a.) .push()
            associatedSeriesJson.sort() // B (2.a.) .sort()
            existingEntry.associated_series_json = JSON.stringify(associatedSeriesJson) // A (1.a.) existingEntry.associated_series_json =; B (2.a.) .stringify()
            projectFileRepo.update(existingEntry) // B (2.a.) projectFileRepo.update()
          }
        }
      }
      fs.writeFileSync(recentFilesTxtPath, refreshedRecentFilesTxtContent) // B (2.a.) .writeFileSync()
    }
    let currentEntries = projectFileRepo.fetch(null, null, null) // A (1.a.) let currentEntries =; B (2.a.) projectFileRepo.fetch()
    for (let entry of currentEntries) {
      // A (1.a.) let entry =;
      if (!fs.existsSync(entry.file_path)) {
        // C (3.a.) fs.existsSync() != true; B (2.a.) .existsSync()
        projectFileRepo.remove(entry.id) // B (2.a.) projectFileRepo.remove()
      }
    }
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to insert and refresh project files: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PF_003
 * ABC analīzes rezultāts:2,5,2
 */
export async function fetchBlendFiles(_, id = null, limit = null, filePath = null) {
  try {
    // C (3.d.) try
    let results = projectFileRepo.fetch(id, limit, filePath) // A (1.a.) let results =; B (2.a.) projectFileRepo.fetch()
    // Sort DESC
    results.sort((a, b) => b.accessed.localeCompare(a.accessed)) // A (1.e.) results.sort(); B (2.a.) (a, b) =>; B (2.a.) b.accessed.localeCompare(a.accessed)
    return results
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to fetch project files: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PF_004
 * ABC analīzes rezultāts: 3,8,5
 */
export async function deleteBlendFile(_, id) {
  try {
    // C (3.d.) try
    let confirmation = await showAskNotification(
      'Are you sure you want to delete this .blend file?',
      'warning'
    ) // A (1.a.) let confirmation =; B (2.a.) showAskNotification()
    if (confirmation === false) {
      // C (3.a.) confirmation == false
      return // B (2.c.) priekšlaicīgs return
    }
    let projectFileList = projectFileRepo.fetch(id) // A (1.a.) let projectFileList =; B (2.a.) projectFileRepo.fetch()
    if (!projectFileList || projectFileList.length === 0) {
      // C (3.a.) projectFileList != truthy; C (3.a.) projectFileList.length === 0
      throw 'Failed to fetch project file by ID' // B (2.c.) throw
    }
    let entry = projectFileList[0] // A (1.a.) let entry =;
    await deleteFile(entry.file_path) // B (2.a.) deleteFile()
    projectFileRepo.remove(entry.id) // B (2.a.) projectFileRepo.remove()
    return
  } catch (err) {
    // C (3.d.) catch
    projectFileRepo.remove(entry.id) // B (2.a.) projectFileRepo.remove()
    await showOkNotification(`Failed to delete project file: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PF_005
 * ABC analīzes rezultāts:11,21,14
 */
export async function openBlendFile(
  _,
  id,
  installedBlenderVersionId,
  launchArgumentsId = null,
  pythonScriptId = null
) {
  try {
    // C (3.d.) try
    let projectFileList = projectFileRepo.fetch(id, null, null) // A (1.a.) let projectFileList =; B (2.a.) projectFileRepo.fetch()
    if (!projectFileList || projectFileList.length === 0) {
      // C (3.a.) projectFileList != truthy; C (3.a.) projectFileList.length === 0
      throw 'Failed to fetch installed project file by ID' // B (2.c.) throw
    }
    let projectFile = projectFileList[0] // A (1.a.) let projectFile =;
    projectFile.last_used_blender_version_id = installedBlenderVersionId // A (1.a.) projectFile.last_used_blender_version_id =;
    projectFileRepo.update(projectFile) // B (2.a.) projectFileRepo.update()
    let installedBlenderVersionList = installedBlenderVersionRepo.fetch(
      installedBlenderVersionId,
      null,
      null
    ) // A (1.a.) let installedBlenderVersionList =; B (2.a.) installedBlenderVersionRepo.fetch()
    if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
      // C (3.a.) installedBlenderVersionList != truthy; C (3.a.) installedBlenderVersionList.length === 0
      throw 'Failed to fetch installed Blender version by ID' // B (2.c.) throw
    }
    let blenderVersion = installedBlenderVersionList[0] // A (1.a.) let blenderVersion =;
    installedBlenderVersionRepo.update(blenderVersion) // B (2.a.) installedBlenderVersionRepo.update()
    let finalLaunchArgs = [projectFile.file_path] // A (1.a.) let finalLaunchArgs =;
    if (launchArgumentsId != null) {
      // C (3.a.) launchArgumentsId != null
      let launchArgumentList = launchArgumentRepo.fetch(launchArgumentsId, null, null) // A (1.a.) let launchArgumentList =; B (2.a.) launchArgumentRepo.fetch()
      if (!launchArgumentList || launchArgumentList.length === 0) {
        // C (3.a.) launchArgumentList != truthy; C (3.a.) launchArgumentList.length === 0
        throw 'Failed to fetch installed launch argument by ID' // B (2.c.) throw
      }
      let argEntry = launchArgumentList[0] // A (1.a.) let argEntry =;
      launchArgumentRepo.update(argEntry) // B (2.a.) launchArgumentRepo.update()
      let parsedArgs = argEntry.argument_string.trim().split(/\s+/) // A (1.a.) let parsedArgs =; B (2.a.) .trim(); B (2.a.) .split()
      finalLaunchArgs.push(...parsedArgs) // B (2.a.) finalLaunchArgs.push()
    }
    if (pythonScriptId != null) {
      // C (3.a.) pythonScriptId != null
      let pythonScriptList = pythonScriptRepo.fetch(pythonScriptId, null, null) // A (1.a.) let pythonScriptList =; B (2.a.) pythonScriptRepo.fetch()
      if (!pythonScriptList || pythonScriptList.length === 0) {
        // C (3.a.) pythonScriptList != truthy; C (3.a.) pythonScriptList.length === 0
        throw 'Failed to fetch installed python script by ID' // B (2.c.) throw
      }
      let scriptEntry = pythonScriptList[0] // A (1.a.) let scriptEntry =;
      pythonScriptRepo.update(scriptEntry) // B (2.a.) pythonScriptRepo.update()
      if (!finalLaunchArgs.includes('--python')) {
        // C (3.a.) finalLaunchArgs.includes() != true; B (2.a.) .includes()
        finalLaunchArgs.push('--python', scriptEntry.script_file_path) // B (2.a.) finalLaunchArgs.push()
      } else {
        // C (3.b.) else
        finalLaunchArgs.push(scriptEntry.script_file_path) // B (2.a.) finalLaunchArgs.push()
      }
    }
    await launchExecutable(blenderVersion.executable_file_path, finalLaunchArgs) // B (2.a.) launchExecutable()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to open project file: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PF_006
 * ABC analīzes rezultāts:6,10,6
 */
export async function createNewProjectFile(_, installedBlenderVersionId, fileName) {
  try {
    // C (3.d.) try
    let directoryPath = await getDirectoryFromFileExplorer() // A (1.a.) let directoryPath =; B (2.a.) getDirectoryFromFileExplorer()
    if (!directoryPath) {
      // C (3.a.) directoryPath != truthy
      return // B (2.c.) priekšlaicīgs return
    }
    if (!fileName.endsWith('.blend')) {
      // C (3.a.) fileName.endsWith('.blend') != truthy; B (2.a.) .endsWith()
      fileName = `${fileName}.blend` // A (1.a.) fileName =;
    }
    let fullFilePath = path.join(directoryPath, fileName) // A (1.a.) let fullFilePath =; B (2.a.) .join()
    let pythonCodeExpression =
      // A (1.a.) let pythonCodeExpression =;
      `
${IMPORT_BPY}
blend_file_path=r"${fullFilePath}"
${SAVE_AS_MAINFILE}
`
    let installedBlenderVersionList = installedBlenderVersionRepo.fetch(
      installedBlenderVersionId,
      null,
      null
    ) // A (1.a.) let installedBlenderVersionList =; B (2.a.) installedBlenderVersionRepo.fetch()
    if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
      // C (3.a.) installedBlenderVersionList != truthy; C (3.a.) installedBlenderVersionList.length === 0
      throw 'Failed to fetch installed Blender version by ID' // B (2.c.) throw
    }
    let entry = installedBlenderVersionList[0] // A (1.a.) let entry =;
    await launchExecutable(entry.executable_file_path, [
      '--background',
      '--python-expr',
      pythonCodeExpression
    ]) // B (2.a.) launchExecutable()
    await insertBlendFile(null, fullFilePath) // B (2.a.) insertBlendFile()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to insert project file: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PF_007
 * ABC analīzes rezultāts:2,5,4
 */
export async function revealProjectFileInLocalFileSystem(_, id) {
  try {
    // C (3.d.) try
    let projectFileList = projectFileRepo.fetch(id) // A (1.a.) let projectFileList =; B (2.a.) projectFileRepo.fetch()
    if (!projectFileList || projectFileList.length === 0) {
      // C (3.a.) projectFileList != truthy; C (3.a.) projectFileList.length === 0
      throw 'Failed to fetch project file by ID' // B (2.c.) throw
    }
    let entry = projectFileList[0] // A (1.a.) let entry =;
    await openInFileExplorer(entry.file_path) //B (2.a.) openInFileExplorer()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to open project file in file explorer: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: PF_008
 * ABC analīzes rezultāts:3,6,4
 */
export async function createProjectFileArchiveFile(_, id) {
  try {
    // C (3.d.) try
    let entryList = projectFileRepo.fetch(id, null, null) // A (1.a.) let entryList =; B (2.a.) projectFileRepo.fetch()
    if (!entryList || entryList.length === 0) {
      // C (3.a.) entryList != truthy; C (3.a.) entryList.length === 0
      throw 'Failed to fetch project file by ID' // B (2.c.) throw
    }
    let entry = entryList[0] // A (1.a.) let entry =;
    let archivePath = await archiveFile(entry.file_path) // A (1.a.) let archivePath =; B (2.a.) archiveFile()
    await openInFileExplorer(archivePath) // B (2.a.) openInFileExplorer()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to archive project file: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}
