import db from './db.js';

function insert(entry) {
    const stmt = db.prepare(`INSERT INTO python_scripts (id, script_file_path) VALUES (?, ?) ON CONFLICT(script_file_path) DO NOTHING`);
    stmt.run(entry.id, entry.script_file_path);
}

function fetch(id = null, limit = null, scriptFilePath = null) {
    if (id) {
        const stmt = db.prepare(`SELECT * FROM python_scripts WHERE id = ?`);
        return stmt.all(id);
    } else if (limit) {
        const stmt = db.prepare(`SELECT * FROM python_scripts LIMIT ?`);
        return stmt.all(limit);
    } else if (scriptFilePath) {
        const stmt = db.prepare(`SELECT * FROM python_scripts WHERE script_file_path = ?`);
        return stmt.all();
    } else {
        const stmt = db.prepare(`SELECT * FROM python_scripts`);
        return stmt.all();
    }
}

function update(script) {
    const stmt = db.prepare(`UPDATE python_scripts SET script_file_path = ?, modified = CURRENT_TIMESTAMP, accessed = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(script.script_file_path, script.id);
}

function remove(id) {
    const stmt = db.prepare(`DELETE FROM python_scripts WHERE id = ?`);
    stmt.run(id);
}

export default {
    insert,
    fetch,
    update,
    remove
};
