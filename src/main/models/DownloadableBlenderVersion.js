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
      Object.assign(this, {
        url, app, version, risk_id, branch, patch, hash, platform,
        architecture, bitness, file_mtime, file_name, file_size,
        file_extension, release_cycle, checksum
      });
    }
  }
  