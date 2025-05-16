import fs from 'fs';
import path from 'path';
import os from 'os';
import Database from 'better-sqlite3';

const baseDir = path.join(os.homedir(), 'AppData', 'Roaming', 'blendio-electronjs');
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

const dbPath = path.join(baseDir, 'test.db');
const db = new Database(dbPath);

// Schema initialization
const schemaSQL = `
-- Installed Blender Versions
CREATE TABLE IF NOT EXISTS installed_blender_versions (
  id TEXT PRIMARY KEY NOT NULL,
  version TEXT NOT NULL,
  variant_type TEXT NOT NULL,
  download_url TEXT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  installation_directory_path TEXT NOT NULL,
  executable_file_path TEXT NOT NULL,
  created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accessed TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
); 

-- Blend Project Files
CREATE TABLE IF NOT EXISTS project_files (
  id TEXT PRIMARY KEY NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  associated_series_json TEXT NOT NULL DEFAULT '[]',
  last_used_blender_version_id TEXT NULL,
  created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accessed TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (last_used_blender_version_id) REFERENCES installed_blender_versions(id) ON DELETE SET NULL
);

-- Python Scripts
CREATE TABLE IF NOT EXISTS python_scripts (
  id TEXT PRIMARY KEY NOT NULL,
  script_file_path TEXT NOT NULL,
  created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accessed TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Launch Arguments
CREATE TABLE IF NOT EXISTS launch_arguments (
  id TEXT PRIMARY KEY NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  argument_string TEXT NOT NULL,
  last_used_project_file_id TEXT NULL,
  last_used_python_script_id TEXT NULL,
  created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accessed TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (last_used_project_file_id) REFERENCES project_files(id) ON DELETE SET NULL,
  FOREIGN KEY (last_used_python_script_id) REFERENCES python_scripts(id) ON DELETE SET NULL
);

-- Install Paths
CREATE TABLE IF NOT EXISTS blender_repo_paths (
  id TEXT PRIMARY KEY NOT NULL,
  repo_directory_path TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accessed TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_file_path ON project_files(file_path);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_python_script_file_path ON python_scripts(script_file_path);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_installed_blender_version_executable_file_path ON installed_blender_versions(executable_file_path);
`;

db.exec(schemaSQL);

export default db;
