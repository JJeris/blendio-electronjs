import { BlenderRepoPath } from '../models/BlenderRepoPath.js';
import db from './db.js';

function insert(repo) {
    const stmt = db.prepare(`INSERT INTO blender_repo_paths (id, repo_directory_path, is_default) VALUES (?, ?, ?)`);
    stmt.run(repo.id, repo.repo_directory_path, repo.is_default ? 1 : 0);
}

function fetch(id = null, limit = null, repoDirectoryPath = null) {
    let rows;
    if (id) {
        const stmt = db.prepare(`SELECT * FROM blender_repo_paths WHERE id = ?`);
        rows = stmt.all(id);
    } else if (limit) {
        const stmt = db.prepare(`SELECT * FROM blender_repo_paths LIMIT ?`);
        rows = stmt.all(limit);
    } else if (repoDirectoryPath) {
        const stmt = db.prepare(`SELECT * FROM blender_repo_paths WHERE repo_directory_path = ?`);
        rows = stmt.all(repoDirectoryPath);
    } else {
        const stmt = db.prepare(`SELECT * FROM blender_repo_paths`);
        rows = stmt.all();
    }
    return rows.map(row => new BlenderRepoPath(row));
}

function update(repo) {
    const stmt = db.prepare(`UPDATE blender_repo_paths SET repo_directory_path = ?, is_default = ?, modified = CURRENT_TIMESTAMP, accessed = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(repo.repo_directory_path, repo.is_default ? 1 : 0, repo.id);
}

function remove(id) {
    const stmt = db.prepare(`DELETE FROM blender_repo_paths WHERE id = ?`);
    stmt.run(id);
}

export default {
    insert,
    fetch,
    update,
    remove
};
