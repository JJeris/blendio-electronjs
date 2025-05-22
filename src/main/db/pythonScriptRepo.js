/* eslint-disable no-useless-catch */
import { PythonScript } from '../models/PythonScript.js'
import db from './db.js'

function insert(entry) {
  try {
    const stmt = db.prepare(
      `INSERT INTO python_scripts (id, script_file_path) VALUES (?, ?) ON CONFLICT(script_file_path) DO NOTHING`
    )
    stmt.run(entry.id, entry.script_file_path)
  } catch (err) {
    throw err
  }
}

function fetch(id = null, limit = null, scriptFilePath = null) {
  try {
    let rows
    if (id) {
      const stmt = db.prepare(`SELECT * FROM python_scripts WHERE id = ?`)
      rows = stmt.all(id)
    } else if (limit) {
      const stmt = db.prepare(`SELECT * FROM python_scripts LIMIT ?`)
      rows = stmt.all(limit)
    } else if (scriptFilePath) {
      const stmt = db.prepare(`SELECT * FROM python_scripts WHERE script_file_path = ?`)
      rows = stmt.all(scriptFilePath)
    } else {
      const stmt = db.prepare(`SELECT * FROM python_scripts`)
      rows = stmt.all()
    }
    return rows.map((row) => new PythonScript(row))
  } catch (err) {
    throw err
  }
}

function update(script) {
  try {
    const stmt = db.prepare(
      `UPDATE python_scripts SET script_file_path = ?, modified = CURRENT_TIMESTAMP, accessed = CURRENT_TIMESTAMP WHERE id = ?`
    )
    stmt.run(script.script_file_path, script.id)
  } catch (err) {
    throw err
  }
}

function remove(id) {
  try {
    const stmt = db.prepare(`DELETE FROM python_scripts WHERE id = ?`)
    stmt.run(id)
  } catch (err) {
    throw err
  }
}

export default {
  insert,
  fetch,
  update,
  remove
}
