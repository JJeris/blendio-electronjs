export class PythonScript {
  constructor({
    id,
    script_file_path,
    created = new Date().toISOString(),
    modified = new Date().toISOString(),
    accessed = new Date().toISOString()
  }) {
    this.id = id
    this.script_file_path = script_file_path
    this.created = created
    this.modified = modified
    this.accessed = accessed
  }
}
