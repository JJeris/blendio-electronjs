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
        this.id = id;
        this.file_path = file_path;
        this.file_name = file_name;
        this.associated_series_json = associated_series_json;
        this.last_used_blender_version_id = last_used_blender_version_id;
        this.created = created;
        this.modified = modified;
        this.accessed = accessed;
    }
  }
  