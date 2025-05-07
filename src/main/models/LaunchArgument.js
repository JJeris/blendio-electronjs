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
      Object.assign(this, {
        id, is_default, argument_string,
        last_used_project_file_id,
        last_used_python_script_id,
        created, modified, accessed
      });
    }
  }
  