/* eslint-disable no-useless-catch */
import { LaunchArgument } from '../models/LaunchArgument.js';
import db from './db.js';

function insert(arg) {
    try {
        const stmt = db.prepare(`INSERT INTO launch_arguments (id, is_default, argument_string, last_used_project_file_id, last_used_python_script_id) VALUES (?, ?, ?, ?, ?)`);
        stmt.run(arg.id, arg.is_default ? 1 : 0, arg.argument_string, arg.last_used_project_file_id, arg.last_used_python_script_id);
    } catch (err) {
        throw err;
    }
}

function fetch(id = null, limit = null, argumentString = null) {
    try {
        let rows;
        if (id) {
            const stmt = db.prepare(`SELECT * FROM launch_arguments WHERE id = ?`);
            rows = stmt.all(id);
        } else if (limit) {
            const stmt = db.prepare(`SELECT * FROM launch_arguments LIMIT ?`);
            rows = stmt.all(limit);
        } else if (argumentString) {
            const stmt = db.prepare(`SELECT * FROM launch_arguments WHERE argument_string = ?`);
            rows = stmt.all(argumentString);
        } else {
            const stmt = db.prepare(`SELECT * FROM launch_arguments`);
            rows = stmt.all();
        }
        return rows.map(row => new LaunchArgument(row));
    } catch (err) {
        throw err;
    }
}

function update(arg) {
    try {
        const stmt = db.prepare(`UPDATE launch_arguments SET is_default = ?, argument_string = ?, last_used_project_file_id = ?, last_used_python_script_id = ?, modified = CURRENT_TIMESTAMP, accessed = CURRENT_TIMESTAMP WHERE id = ?`);
        stmt.run(arg.is_default ? 1 : 0, arg.argument_string, arg.last_used_project_file_id, arg.last_used_python_script_id, arg.id);
    } catch (err) {
        throw err;
    }
}

function remove(id) {
    try {
        const stmt = db.prepare(`DELETE FROM launch_arguments WHERE id = ?`);
        stmt.run(id);
    } catch (err) {
        throw err;
    }
}

export default {
    insert,
    fetch,
    update,
    remove
};