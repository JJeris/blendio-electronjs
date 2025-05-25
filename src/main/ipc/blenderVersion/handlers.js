/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { v4 as uuidv4 } from 'uuid'
import {
  blenderRepoPathRepo,
  installedBlenderVersionRepo,
  launchArgumentRepo,
  pythonScriptRepo
} from '../../db'
import { BlenderRepoPath, InstalledBlenderVersion } from '../../models'
import {
  deleteDirectory,
  deleteFile,
  extractArchive,
  getDirectoryFromFileExplorer,
  launchExecutable
} from '../fileSystemUtility/handlers'
import path from 'path'
import fs from 'fs'
import { showAskNotification, showOkNotification } from '../fileSystemUtility/handlers.js'

/**
 * ID: BV_001
 * ABC analīzes rezultāts:7,14,5
 */
export async function insertInstalledBlenderVersion(_, executableFilePath) {
  try {
    // C (3.d.) try
    let parentDir = path.dirname(executableFilePath) // A (1.a.) let parentDir =;
    if (!parentDir) {
      // C (3.a.) parentDir != truthy
      throw 'Failed to get file path parent' // B (2.c.) throw
    }
    let dirName = path.basename(parentDir) // A (1.a.) let dirName =; B (2.a.) .basename()
    let regex = /blender-(\d+\.\d+(?:\.\d+)?)-([^\-+]+)/ // A (1.a.) let regex =
    let match = dirName.match(regex) // A (1.a.) let match =; B (2.a.) .match()
    let version = match?.[1] ?? '' // A (1.a.) let version =; C (3.e.) match?.;
    let variantType = match?.[2] ?? '' // A (1.a.) let variantType =; C (3.e.) match?.;
    let entry = new InstalledBlenderVersion({
      // A (1.a.) let entry =; B (2.b.) new InstalledBlenderVersion
      id: uuidv4(), // B (2.a.) uuidv4();
      version,
      variant_type: variantType,
      download_url: null,
      is_default: false,
      installation_directory_path: parentDir,
      executable_file_path: executableFilePath,
      created: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      modified: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      accessed: new Date().toISOString() // B (2.b.) new Date(); B (2.a.) .toISOString()
    })
    installedBlenderVersionRepo.insert(entry) // B (2.a.) installedBlenderVersionRepo.insert()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to insert installed Blender version: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_002
 * ABC analīzes rezultāts:8,15,6
 */
export async function insertAndRefreshInstalledBlenderVersions(_) {
  try {
    // C (3.d.) try
    let blenderRepoPaths = blenderRepoPathRepo.fetch(null, null, null) // A (1.a.) let blenderRepoPaths =; B (2.a.) blenderRepoPathRepo.fetch(
    for (let repoPath of blenderRepoPaths) {
      // A (1.a.) let repoPath=;
      let entries = fs.readdirSync(repoPath.repo_directory_path, { withFileTypes: true }) // A (1.a.) let entries =; B (2.a.) .readdirSync()
      for (let entry of entries) {
        // A (1.a.) let entry=;
        if (!entry.isDirectory()) {
          // C (3.a.) entry.isDirectory() != true; B (2.a.) .isDirectory()
          continue // B (2.c.) continue
        }
        let launcherPath = path.join(
          repoPath.repo_directory_path,
          entry.name,
          'blender-launcher.exe'
        ) // A (1.a.) let launcherPath =; B (2.a.) .join()
        if (!fs.existsSync(launcherPath)) {
          // C (3.a.) fs.existsSync() != true; B (2.a.) .existsSync()
          continue // B (2.c.) continue
        }
        let existingEntries = installedBlenderVersionRepo.fetch(null, null, launcherPath) // A (1.a.) let existingEntries =; B (2.a.) installedBlenderVersionRepo.fetch()
        if (existingEntries.length > 0) {
          // C (3.a.) existingEntries.length > 0
          continue // B (2.c.) continue
        }
        await insertInstalledBlenderVersion(null, launcherPath) // B (2.a.) insertInstalledBlenderVersion()
      }
    }
    let currentEntries = installedBlenderVersionRepo.fetch(null, null, null) // A (1.a.) let currentEntries =; B (2.a.) installedBlenderVersionRepo.fetch()
    for (let entry of currentEntries) {
      // A (1.a.) let entry =;
      if (!fs.existsSync(entry.executable_file_path)) {
        // C (3.a.) fs.existsSync() != true; B (2.a.) .existsSync()
        installedBlenderVersionRepo.remove(entry.id) // B (2.a.) installedBlenderVersionRepo.remove()
      }
    }
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(
      `Failed to insert and refresh installed Blender version: ${err}`,
      'error'
    ) // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_003
 * ABC analīzes rezultāts:7,7,7
 */
export async function updateInstalledBlenderVersion(_, id, isDefault) {
  try {
    // C (3.d.) try
    let results = installedBlenderVersionRepo.fetch(id) // A (1.a.) let results =; B (2.a.) installedBlenderVersionRepo.fetch()
    if (results.length == 0) {
      // C (3.a.) results.length === 0
      throw 'Failed to fetch installed Blender version by ID' // B (2.c.) throw
    }
    let entry = results[0] // A (1.a.) let entry =
    if (isDefault === true) {
      // C (3.a.) isDefault === true
      entry.is_default = false // A (1.a.) entry.is_default =
      installedBlenderVersionRepo.update(entry) // B (2.a.) installedBlenderVersionRepo.update()
    } else {
      // C (3.b.) else;
      let entries = installedBlenderVersionRepo.fetch() // A (1.a.) let entries =; B (2.a.) installedBlenderVersionRepo.fetch()
      for (let entry of entries) {
        // A (1.a.) let entry
        let newDefault = entry.id === id // A (1.a.) let newDefault =; C (3.a.) entry.id === id
        if (entry.is_default !== newDefault) {
          // C (3.a.) entry.is_default !== newDefault
          entry.is_default = newDefault // A (1.a.) entry.is_default =
          installedBlenderVersionRepo.update(entry) // B (2.a.) installedBlenderVersionRepo.update()
        }
      }
      return
    }
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to update installed Blender versions: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_004
 * ABC analīzes rezultāts:2,5,2
 */
export async function fetchInstalledBlenderVersions(
  _,
  id = null,
  limit = null,
  executableFilePath = null
) {
  try {
    // C (3.d.) try
    let results = installedBlenderVersionRepo.fetch(id, limit, executableFilePath) // A (1.a.) let results =; B (2.a.) installedBlenderVersionRepo.fetch()
    // Sort DESC
    results.sort((a, b) => b.version.localeCompare(a.version)) // A (1.e.) results.sort(); B (2.a.) (a, b) =>; B (2.a.) b.version.localeCompare(a.version)
    return results
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to fetch installed Blender versions: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_005
 * ABC analīzes rezultāts:3,9,5
 */
export async function uninstallAndDeleteInstalledBlenderVersionData(_, id) {
  try {
    // C (3.d.) try
    const confirmation = await showAskNotification(
      'Are you sure you want to delete this installed Blender version?',
      'warning'
    ) // A (1.a.) let confirmation =; B (2.a.) showAskNotification()
    if (confirmation === false) {
      // C (3.a.) confirmation === false
      return // B (2.c.) priekšlaicīgs return
    }
    let installedBlenderVersionList = installedBlenderVersionRepo.fetch(id) // A (1.a.) let installedBlenderVersionList =; B (2.a.) installedBlenderVersionRepo.fetch()
    if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
      // C (3.a.) installedBlenderVersionList != truthy; C (3.a.) installedBlenderVersionList.length === 0
      throw 'Failed to fetch installed Blender version by ID' // B (2.c.) throw
    }
    let entry = installedBlenderVersionList[0] // A (1.a.) let entry =;
    await deleteDirectory(entry.installation_directory_path) // B (2.a.) deleteDirectory()
    installedBlenderVersionRepo.remove(entry.id) // B (2.a.) installedBlenderVersionRepo.remove()
    return
  } catch (err) {
    // C (3.d.) catch
    installedBlenderVersionRepo.remove(entry.id) // B (2.a.) installedBlenderVersionRepo.remove()
    await showOkNotification(`Failed to delete installed Blender version: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_006
 * ABC analīzes rezultāts:10,16,11
 */
export async function launchBlenderVersionWithLaunchArgs(
  _,
  id,
  launchArgumentsId = null,
  pythonScriptId = null
) {
  try {
    let installedBlenderVersionList = installedBlenderVersionRepo.fetch(id, null, null) // A (1.a.) let installedBlenderVersionList =; B (2.a.) installedBlenderVersionRepo.fetch()
    if (!installedBlenderVersionList || installedBlenderVersionList.length === 0) {
      // C (3.a.) installedBlenderVersionList != truthy; C (3.a.) installedBlenderVersionList.length === 0

      throw 'Failed to fetch installed Blender version by ID' // B (2.c.) throw
    }
    let instance = installedBlenderVersionList[0] // A (1.a.) let instance =;
    installedBlenderVersionRepo.update(instance) // B (2.a.) installedBlenderVersionRepo.update()
    let finalLaunchArgs = [] // A (1.a.) let finalLaunchArgs =;
    if (launchArgumentsId != null) {
      // C (3.a.) launchArgumentsId != null
      let launchArgumentList = launchArgumentRepo.fetch(launchArgumentsId, null, null) // A (1.a.) let launchArgumentList =; B (2.a.) launchArgumentRepo.fetch()
      if (!launchArgumentList || launchArgumentList.length === 0) {
        // C (3.a.) launchArgumentList != truthy; C (3.a.) launchArgumentList.length === 0
        throw 'Failed to fetch launch argument by ID' // B (2.c.) throw
      }
      let argEntry = launchArgumentList[0] // A (1.a.) let argEntry =;
      launchArgumentRepo.update(argEntry) // B (2.a.) launchArgumentRepo.update()
      let parsedArgs = argEntry.argument_string.trim().split(/\s+/) // A (1.a.) let parsedArgs =; B (2.a.) .trim(); B (2.a.) .split()
      finalLaunchArgs.push(...parsedArgs) // B (2.a.) .push()
    }
    if (pythonScriptId != null) {
      // C (3.a.) pythonScriptId != null
      let pythonScriptList = pythonScriptRepo.fetch(pythonScriptId, null, null) // A (1.a.) let pythonScriptList =; B (2.a.) pythonScriptRepo.fetch()
      if (!pythonScriptList || pythonScriptList.length === 0) {
        // C (3.a.) pythonScriptList != truthy; C (3.a.) pythonScriptList.length === 0
        throw 'Failed to fetch python script by ID' // B (2.c.) throw
      }
      let scriptEntry = pythonScriptList[0] // A (1.a.) let scriptEntry =;
      pythonScriptRepo.update(scriptEntry) // B (2.a.) pythonScriptRepo.update()
      if (!finalLaunchArgs.includes('--python')) {
        // C (3.a.) finalLaunchArgs.includes() != true; B (2.a.) .includes()
        finalLaunchArgs.push('--python', scriptEntry.script_file_path) // A (1.e) finalLaunchArgs.push()
      } else {
        // C (3.b.) else
        finalLaunchArgs.push(scriptEntry.script_file_path) // A (1.e) finalLaunchArgs.push()
      }
    }
    await launchExecutable(instance.executable_file_path, finalLaunchArgs) // B (2.a.) launchExecutable()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to launch installed Blender version: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_007
 * ABC analīzes rezultāts:4,10,17
 */
export async function getDownloadableBlenderVersionData(_) {
  try {
    // C (3.d.) try
    let platform = process.platform // A (1.a.) let platform =;
    let response = await fetch('https://builder.blender.org/download/daily/?format=json&v=2') // A (1.a.) let response =; B (2.a.) fetch()
    let responseJson = await response.json() // A (1.a.) let responseJson =; B (2.a.) .json()
    let filteredData = responseJson.filter((p) => {
      // A (1.a.) let filteredData =; B (2.a.) .filter(); B (2.a.) p => {}
      if (platform === 'win32') {
        // C (3.a.) platform === "win32"
        return (
          p.bitness === 64 && // B (2.c.) return; C (3.a.) p.bitness === 64
          p.platform === 'windows' && // C (3.a.) p.platform === "windows"
          p.architecture === 'amd64' && // C (3.a.) p.architecture === "amd64"
          p.file_extension === 'zip'
        ) // C (3.a.) p.file_extension === "zip"
      }
      if (platform === 'darwin') {
        // C (3.a.) platform === "darwin"
        return (
          p.bitness === 64 && // B (2.c.) return; C (3.a.) p.bitness === 64
          p.platform === 'darwin' && // C (3.a.) p.platform === 'darwin'
          p.architecture === 'arm64' && // C (3.a.) p.architecture === 'arm64'
          p.file_extension === 'dmg'
        ) // C (3.a.) p.file_extension === 'dmg'
      }
      if (platform === 'linux') {
        // C (3.a.) platform === "linux"
        return (
          p.bitness === 64 && // B (2.c.) return; C (3.a.) p.bitness === 64
          p.platform === 'linux' && // C (3.a.)  p.platform === 'linux'
          p.architecture === 'x86_64' && // C (3.a.) p.architecture === 'x86_64'
          p.file_extension === 'xz'
        ) // C (3.a.) p.file_extension === 'xz'
      }
      return false // B (2.c.) return;
    })
    return filteredData
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to fetch downloadable Blender versions: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_008
 * ABC analīzes rezultāts:15,24,5
 */
export async function downloadAndInstallBlenderVersion(
  _,
  archiveFilePath,
  downloadableBlenderVersion
) {
  try {
    // C (3.d.) try
    let entry = new InstalledBlenderVersion({
      // A (1.a.) let entry =; B (2.b.) new InstalledBlenderVersion;
      id: uuidv4(), // B (2.a.) uuidv4();
      version: downloadableBlenderVersion.version,
      variant_type: downloadableBlenderVersion.release_cycle,
      download_url: downloadableBlenderVersion.url,
      is_default: false,
      installation_directory_path: '',
      executable_file_path: '',
      created: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      modified: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      accessed: new Date().toISOString() // B (2.b.) new Date(); B (2.a.) .toISOString()
    })
    let installationDirectoryPath = await extractArchive(archiveFilePath) // A (1.a.) let installationDirectoryPath =; B (2.a.) extractArchive()
    entry.installation_directory_path = installationDirectoryPath // A (1.a.) entry.installation_directory_path =
    entry.executable_file_path = path.join(installationDirectoryPath, 'blender-launcher.exe') //  A (1.a.) entry.executable_file_path =; B (2.a.) .join()
    await deleteFile(archiveFilePath) // B (2.b.) deleteFile()
    let existingEntries = installedBlenderVersionRepo.fetch(null, null, entry.executable_file_path) // A (1.a.) let existingEntries =; B (2.a.) installedBlenderVersionRepo.fetch()
    if (!existingEntries || existingEntries.length === 0) {
      // C (3.a.) existingEntries != truthy; C (3.a.) existingEntries.length === 0
      installedBlenderVersionRepo.insert(entry) // B (2.a.) installedBlenderVersionRepo.insert()
      return // B (2.c.) priekšlaicīgs return
    } else {
      // C (3.b.) else
      let oldEntry = existingEntries[0] // A (1.a.) let oldEntry =;
      oldEntry.version = entry.version // A (1.a.) oldEntry.version =
      oldEntry.variant_type = entry.variant_type // A (1.a.) oldEntry.variant_type =
      oldEntry.download_url = entry.download_url // A (1.a.) oldEntry.download_url =
      oldEntry.is_default = entry.is_default // A (1.a.) oldEntry.is_default =
      oldEntry.installation_directory_path = entry.installation_directory_path // A (1.a.) oldEntry.installation_directory_path =
      oldEntry.executable_file_path = entry.executable_file_path // A (1.a.) oldEntry.executable_file_path =
      oldEntry.created = new Date().toISOString() // A (1.a.) oldEntry.created =; B (2.b.) new Date(); B (2.a.) .toISOString()
      oldEntry.modified = new Date().toISOString() // A (1.a.) oldEntry.modified =; B (2.b.) new Date(); B (2.a.) .toISOString()
      oldEntry.accessed = new Date().toISOString() // A (1.a.) oldEntry.accessed =; B (2.b.) new Date(); B (2.a.) .toISOString()
      installedBlenderVersionRepo.update(oldEntry) // B (2.a.) installedBlenderVersionRepo.update()
      return // B (2.c.) priekšlaicīgs return
    }
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to insert installed Blender version: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_009
 * ABC analīzes rezultāts:2,14,5
 */
export async function insertBlenderVersionInstallationLocation() {
  try {
    // C (3.d.) try
    let repoDirectoryPath = await getDirectoryFromFileExplorer() // A (1.a.) let repoDirectoryPath =; B (2.a.) getDirectoryFromFileExplorer()
    if (!repoDirectoryPath) {
      // C (3.a.) repoDirectoryPath != truthy
      return // B (2.c.) priekšlaicīgs return
    }
    let results = blenderRepoPathRepo.fetch(null, null, repoDirectoryPath)
    if (results && results.length > 0) {
      // C (3.a.) results == truthy; C (3.a.) results.length > 0
      return // B (2.c.) priekšlaicīgs return
    }
    let entry = new BlenderRepoPath({
      // A (1.a.) let entry =; B (2.b.) new BlenderRepoPath;
      id: uuidv4(), // B (2.a.) uuidv4();
      repo_directory_path: repoDirectoryPath,
      is_default: false,
      created: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      modified: new Date().toISOString(), // B (2.b.) new Date(); B (2.a.) .toISOString()
      accessed: new Date().toISOString() // B (2.b.) new Date(); B (2.a.) .toISOString()
    })
    blenderRepoPathRepo.insert(entry) // B (2.a.) blenderRepoPathRepo.insert()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to insert Blender repo path: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_010
 * ABC analīzes rezultāts:7,7,7
 */
export async function updateBlenderVersionInstallationLocation(_, id, isDefault) {
  try {
    // C (3.d.) try
    let results = blenderRepoPathRepo.fetch(id) // A (1.a.) let results =; B (2.a.) blenderRepoPathRepo.fetch()
    if (results.length == 0) {
      // C (3.a.) results.length === 0
      throw 'Failed to fetch Blender repo paths by ID' // B (2.c.) throw
    }
    let entry = results[0] // A (1.a.) let entry =
    if (isDefault === true) {
      // C (3.a.) isDefault === true
      entry.is_default = false // A (1.a.) entry.is_default =
      blenderRepoPathRepo.update(entry) // B (2.a.) blenderRepoPathRepo.update()
    } else {
      // C (3.b.) else;
      let entries = blenderRepoPathRepo.fetch() // A (1.a.) let entries =; B (2.a.) blenderRepoPathRepo.fetch()
      for (let entry of entries) {
        // A (1.a.) let entry
        let newDefault = entry.id === id // A (1.a.) let newDefault =; C (3.a.) entry.id === id
        if (entry.is_default !== newDefault) {
          // C (3.a.) entry.is_default !== newDefault
          entry.is_default = newDefault // A (1.a.) entry.is_default =
          blenderRepoPathRepo.update(entry) // B (2.a.) blenderRepoPathRepo.update()
        }
      }
      return
    }
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to update Blender repo path: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_011
 * ABC analīzes rezultāts:1,3,2
 */
export async function fetchBlenderVersionInstallationLocations(
  _,
  id = null,
  limit = null,
  repoDirectoryPath = null
) {
  try {
    // C (3.d.) try
    let results = blenderRepoPathRepo.fetch(id, limit, repoDirectoryPath) // A (1.a.) let results =; B (2.a.) blenderRepoPathRepo.fetch()
    return results
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to fetch Blender repo paths: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}

/**
 * ID: BV_012
 * ABC analīzes rezultāts:5,10,6
 */
export async function deleteBlenderVersionInstallationLocation(_, id) {
  try {
    // C (3.d.) try
    let confirmation = await showAskNotification(
      'Are you sure you want to delete this Blender installation location?',
      'warning'
    ) // A (1.a.) let confirmation =; B (2.a.) showAskNotification()
    if (confirmation === false) {
      // C (3.a.) confirmation == false
      return // B (2.c.) priekšlaicīgs return
    }
    let blenderRepoPathList = blenderRepoPathRepo.fetch(id, null, null) // A (1.a.) let blenderRepoPathList =; B (2.a.) blenderRepoPathRepo.fetch()
    if (blenderRepoPathList.length == 0) {
      // C (3.a.) blenderRepoPathList.length == 0
      throw 'Failed to fetch Blender repo paths by ID' // B (2.c.) throw
    }
    let blenderRepoPathEntry = blenderRepoPathList[0] // A (1.a.) let blenderRepoPathEntry =;
    let installedBlenderVersionList = installedBlenderVersionRepo.fetch(null, null, null) // A (1.a.) let installedBlenderVersionList =; B (2.a.) installedBlenderVersionRepo.fetch()
    for (let version of installedBlenderVersionList) {
      // A (1.a.) let version =;
      if (
        version.installation_directory_path &&
        version.installation_directory_path.startsWith(blenderRepoPathEntry.repo_directory_path)
      ) {
        // C (3.a.) version.installation_directory_path == truthy; C (3.a.) version.installation_directory_path.startsWith() == true; B (2.a.) .startsWith()
        installedBlenderVersionRepo.remove(version.id) // B (2.a.) installedBlenderVersionRepo.remove()
      }
    }
    blenderRepoPathRepo.remove(id) // B (2.a.) installedBlenderVersionRepo.remove()
    return
  } catch (err) {
    // C (3.d.) catch
    await showOkNotification(`Failed to delete Blender repo path entry: ${err}`, 'error') // B (2.a.) showOkNotification()
    throw err // B (2.c.) throw
  }
}
