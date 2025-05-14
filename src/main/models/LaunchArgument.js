export class LaunchArgument {
  constructor({
    id,
    is_default = false,
    argument_string,
    last_used_project_file_id = null,
    last_used_python_script_id = null,
    created = new Date().toISOString(),
    modified = new Date().toISOString(),
    accessed = new Date().toISOString()
  }) {
    this.id = id;
    this.is_default = Boolean(is_default);
    this.argument_string = argument_string;
    this.last_used_project_file_id = last_used_project_file_id;
    this.last_used_python_script_id = last_used_python_script_id;
    this.created = created;
    this.modified = modified;
    this.accessed = accessed;
  }
}
