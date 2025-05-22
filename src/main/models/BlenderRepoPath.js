export class BlenderRepoPath {
  constructor({
    id,
    repo_directory_path,
    is_default = 0,
    created = new Date().toISOString(),
    modified = new Date().toISOString(),
    accessed = new Date().toISOString()
  }) {
    this.id = id
    this.repo_directory_path = repo_directory_path
    this.is_default = Boolean(is_default)
    this.created = created
    this.modified = modified
    this.accessed = accessed
  }
}
