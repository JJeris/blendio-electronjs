export class InstalledBlenderVersion {
    constructor({
      id,
      version,
      variant_type,
      download_url = null,
      is_default = 0,
      installation_directory_path,
      executable_file_path,
      created = new Date().toISOString(),
      modified = new Date().toISOString(),
      accessed = new Date().toISOString()
    }) {
        this.id = id;
        this.version = version;
        this.variant_type = variant_type;
        this.download_url = download_url;
        this.is_default = Boolean(is_default),
        this.installation_directory_path = installation_directory_path;
        this.executable_file_path = executable_file_path;
        this.created = created;
        this.modified = modified;
        this.accessed = accessed;
    }
  }
  