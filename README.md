# blendio-electronjs

An Electron application with React

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```


cs src-tauri
cargo install sqlx-cli --no-default-features --features sqlite
sqlx database create --database-url sqlite:///C:/Users/J/AppData/Roaming/com.bakalaurs.blendio-tauri/test.db
sqlx migrate add create_users_table
sqlx migrate run --database-url sqlite:///C:/Users/J/AppData/Roaming/com.bakalaurs.blendio-tauri/test.db
sqlx migrate run --database-url sqlite:///C:\Users\J\AppData\Roaming\com.bakalaurs.blendio-tauri\test.db

TODO:
- Do electronJS equivalent.
OK- db set up models and migratios
OK- Python scripts
OK- Launch arguments
OK- Blender installation locations
OK- Blender download
- Fix download notif.
OK- Blender installation
OK- Blender uninstallation
OK- Blender launch (basic).
OK- Project files
OK- Reveal, 
OK- archive, 
OK- create, 
OK- open.
OK- Read in existing Blender versions (?)

------- Consider adding foreign key to blender_repo_paths
------- Consider adding index to blender_repo_paths.
------- Give implementation to the foreign keys - show small text bubbles that show the information about the FK tables entry, excluding ID and timestamps. 
------- Move const values to const files.





OK- Lietotnei jāspēj noteikt interneta savienojuma statusu un informēt lietotāju, ja tas nav pieejams;
OK- Update Blender installation to, after download, check if entry exists. If exists, then handle accordingly, ideally, delete old entry and old files, start fresh. Both frameworks.
OK- Update FE table to not show UUIDs.
OK- Clean up FE issues
OK- Update UI to fetch value in catch blocks
OK- Update inerts refresh for Blender and Project files to delete entries, that no longer exist by their filepath.
OK- Update js code to not use New, because the lists are mapped to the classes.
OK- Compare the code to fix any mistakes or misaligned code, that would hinder analysis.
OK- Implement notification system and add basic error text - minimal, max 10 words each.
OK- Python scripts (B/F)
OK- Launch args (B/F)
OK- Blender versions (B/F)
OK- Project Files (B/F)
OK- FSU (B/F)
OK- Validate update mechanisms = update should update the modified and accessed. Fetch should update the accessed.
- Build it for windows successfully.

- Update specification.
- Finish projektējums
- Redo screenshots
- Finish the devlog - clean up text so that its readable.
- Code analysis.
- Performance analysis
- Results
- Theory.

!!!!!!
        for (const version of installedBlenderVersionList) {
        ..Default::default()