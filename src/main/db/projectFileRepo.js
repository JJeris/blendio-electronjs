import { ProjectFile } from '../models/ProjectFile.js';
import db from './db.js';

function insert(file) {
    const stmt = db.prepare(`INSERT INTO project_files (id, file_path, file_name, associated_series_json, last_used_blender_version_id) VALUES (?, ?, ?, ?, ?) ON CONFLICT(file_path) DO NOTHING`);
    stmt.run(file.id, file.file_path, file.file_name, file.associated_series_json, file.last_used_blender_version_id);
}

function fetch(id = null, limit = null, filePath = null) {
    let rows;
    if (id) {
        const stmt = db.prepare(`SELECT * FROM project_files WHERE id = ?`);
        rows = stmt.all(id);
    } else if (limit) {
        const stmt = db.prepare(`SELECT * FROM project_files LIMIT ?`);
        rows = stmt.all(limit);
    } else if (filePath) {
        const stmt = db.prepare(`SELECT * FROM project_files WHERE file_path = ?`);
        rows = stmt.all(filePath);
    } else {
        const stmt = db.prepare(`SELECT * FROM project_files`);
        rows = stmt.all();
    }
    return rows.map(row => new ProjectFile(row));
}

function update(file) {
    const stmt = db.prepare(`UPDATE project_files SET file_path = ?, file_name = ?, associated_series_json = ?, last_used_blender_version_id = ?, modified = CURRENT_TIMESTAMP, accessed = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(file.file_path, file.file_name, file.associated_series_json, file.last_used_blender_version_id, file.id);
}

function remove(id) {
    const stmt = db.prepare(`DELETE FROM project_files WHERE id = ?`);
    stmt.run(id);
}

export default {
    insert,
    fetch,
    update,
    remove
};


