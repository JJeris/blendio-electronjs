import { InstalledBlenderVersion } from "../models";
import db from "./db";

function insert(version) {
    const stmt = db.prepare(`INSERT INTO installed_blender_versions (id, version, variant_type, download_url, is_default, installation_directory_path, executable_file_path) VALUES (?, ?, ?, ?, ?, ?, ?)  ON CONFLICT(executable_file_path) DO NOTHING`);
    stmt.run(version.id, version.version, version.variant_type, version.download_url, version.is_default ? 1 : 0, version.installation_directory_path, version.executable_file_path);
}

function fetch(id = null, limit = null, executableFilePath = null) {
    let rows;
    if (id) {
        const stmt = db.prepare(`SELECT * FROM installed_blender_versions WHERE id = ?`);
        rows = stmt.all(id);
    } else if (limit) {
        const stmt = db.prepare(`SELECT * FROM installed_blender_versions LIMIT ?`);
        rows = stmt.all(limit);
    } else if (executableFilePath) {
        const stmt = db.prepare(`SELECT * FROM installed_blender_versions WHERE executable_file_path = ?`);
        rows = stmt.all(executableFilePath);
    } else {
        const stmt = db.prepare(`SELECT * FROM installed_blender_versions`);
        rows = stmt.all();
    }
    return rows.map(row => new InstalledBlenderVersion(row));
}

function update(version) {
    const stmt = db.prepare(`UPDATE installed_blender_versions SET version = ?, variant_type = ?, download_url = ?, is_default = ?, installation_directory_path = ?, executable_file_path = ?, modified = CURRENT_TIMESTAMP, accessed = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(version.version, version.variant_type, version.download_url, version.is_default ? 1 : 0, version.installation_directory_path, version.executable_file_path, version.id);
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