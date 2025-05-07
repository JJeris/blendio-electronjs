import db from "./db";

function insert(version) {
    const stmt = db.prepare(`INSERT INTO installed_blender_versions (id, version, variant_type, download_url, is_default, installation_directory_path, executable_file_path) VALUES (?, ?, ?, ?, ?, ?, ?)  ON CONFLICT(executable_file_path) DO NOTHING`);
    stmt.run(version.id, version.version, version.varian_type, version.download_url, version.is_default, version.installation_directory_path, version.executable_file_path);
}

function fetch(id = null, limit = null, executableFilePath = null) {
    if (id) {
        const stmt = db.prepare(`SELECT * FROM installed_blender_versions WHERE id = ?`);
        return stmt.all(id);
    } else if (limit) {
        const stmt = db.prepare(`SELECT * FROM installed_blender_versions LIMIT ?`);
        return stmt.all(limit);
    } else if (executableFilePath) {
        const stmt = db.prepare(`SELECT * FROM installed_blender_versions WHERE executable_file_path = ?`);
        return stmt.all();
    } else {
        const stmt = db.prepare(`SELECT * FROM installed_blender_versions`);
        return stmt.all();
    }
}

function update(version) {
    const stmt = db.prepare(`UPDATE installed_blender_versions SET version = ?, variant_type = ?, download_url = ?, is_default = ?, installation_directory_path = ?, executable_file_path = ?, modified = CURRENT_TIMESTAMP, accessed = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(repo.repo_directory_path, repo.is_default ? 1 : 0, repo.id);
}

function remove(id) {
    const stmt = db.prepare(`DELETE FROM installed_blender_versions WHERE id = ?`);
    stmt.run(id);
}

export default {
    insert,
    fetch,
    update,
    remove
};