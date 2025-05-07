export class ProjectFile {
    constructor({
      id,
      file_path,
      file_name,
      associated_series_json = '[]',
      last_used_blender_version_id = null,
      created = new Date().toISOString(),
      modified = new Date().toISOString(),
      accessed = new Date().toISOString()
    }) {
      Object.assign(this, {
        id, file_path, file_name, associated_series_json,
        last_used_blender_version_id, created, modified, accessed
      });
    }
  }
  