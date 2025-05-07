import db from './db.js';

function insert(entry) {
    const stmt = db.prepare(`INSERT INTO launch_arguments (id, is_default, argument_string, last_used_project_file_id, last_used_python_script_id) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(entry.id, entry.script_file_path);
}

function fetch(id = null, limit = null, argumentString = null) {
    if (id) {
        const stmt = db.prepare(`SELECT * FROM launch_arguments WHERE id = ?`);
        return stmt.all(id);
    } else if (limit) {
        const stmt = db.prepare(`SELECT * FROM launch_arguments LIMIT ?`);
        return stmt.all(limit);
    } else if (argumentString) {
        const stmt = db.prepare(`SELECT * FROM launch_arguments WHERE argument_string = ?`);
        return stmt.all();
    } else {
        const stmt = db.prepare(`SELECT * FROM launch_arguments`);
        return stmt.all();
    }
}

function update(script) {
    const stmt = db.prepare(`UPDATE launch_arguments SET is_default = ?, argument_string = ?, last_used_project_file_id = ?, last_used_python_script_id = ?, modified = CURRENT_TIMESTAMP, accessed = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(script.script_file_path, script.id);
}

function remove(id) {
    const stmt = db.prepare(`DELETE FROM launch_arguments WHERE id = ?`);
    stmt.run(id);
}

export default {
    insert,
    fetch,
    update,
    remove
};

