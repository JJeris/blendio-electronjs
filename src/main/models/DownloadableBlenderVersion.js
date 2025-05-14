export class DownloadableBlenderVersion {
  constructor({
    url,
    app,
    version,
    risk_id,
    branch,
    patch = null,
    hash,
    platform,
    architecture,
    bitness,
    file_mtime,
    file_name,
    file_size,
    file_extension,
    release_cycle,
    checksum
  }) {
      this.url = url; 
      this.app = app; 
      this.version = version;
      this.risk_id = risk_id;
      this.branch = branch;
      this.patch = patch;
      this.hash = hash;
      this.platform = platform;
      this.architecture = architecture;
      this.bitness = bitness;
      this.file_mtime = file_mtime;
      this.file_name = file_name;
      this.file_size = file_size;
      this.file_extension = file_extension;
      this.release_cycle = release_cycle;
      this.checksum = checksum;
  }
}
