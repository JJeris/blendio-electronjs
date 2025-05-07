import db from './db.js';

function insert(entry) {
    const stmt = db.prepare(`INSERT INTO project_files (id, file_path, file_name, associated_series_json, last_used_blender_version_id) VALUES (?, ?, ?, ?, ?) ON CONFLICT(file_path) DO NOTHING`);
    stmt.run(entry.id, entry.script_file_path);
}

function fetch(id = null, limit = null, filePath = null) {
    if (id) {
        const stmt = db.prepare(`SELECT * FROM project_files WHERE id = ?`);
        return stmt.all(id);
    } else if (limit) {
        const stmt = db.prepare(`SELECT * FROM project_files LIMIT ?`);
        return stmt.all(limit);
    } else if (filePath) {
        const stmt = db.prepare(`SELECT * FROM project_files WHERE file_path = ?`);
        return stmt.all();
    } else {
        const stmt = db.prepare(`SELECT * FROM project_files`);
        return stmt.all();
    }
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


