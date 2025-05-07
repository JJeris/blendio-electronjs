export class InstalledBlenderVersion {
    constructor({
      id,
      version,
      variant_type,
      download_url = null,
      is_default = false,
      installation_directory_path,
      executable_file_path,
      created = new Date().toISOString(),
      modified = new Date().toISOString(),
      accessed = new Date().toISOString()
    }) {
      Object.assign(this, {
        id, version, variant_type, download_url, is_default,
        installation_directory_path, executable_file_path,
        created, modified, accessed
      });
    }
  }
  