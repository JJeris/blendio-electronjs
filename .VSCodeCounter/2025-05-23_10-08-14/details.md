# Details

Date : 2025-05-23 10:08:14

Directory c:\\bakalaura_darba\\blendio-electronjs

Total : 47 files,  3505 codes, 438 comments, 318 blanks, all 4261 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.prettierignore](/.prettierignore) | Ignore | 6 | 0 | 1 | 7 |
| [.prettierrc.yaml](/.prettierrc.yaml) | YAML | 4 | 0 | 1 | 5 |
| [README.md](/README.md) | Markdown | 0 | 0 | 1 | 1 |
| [dev-app-update.yml](/dev-app-update.yml) | YAML | 3 | 0 | 1 | 4 |
| [electron-builder.yml](/electron-builder.yml) | YAML | 47 | 0 | 1 | 48 |
| [electron.vite.config.mjs](/electron.vite.config.mjs) | JavaScript | 19 | 0 | 2 | 21 |
| [eslint.config.mjs](/eslint.config.mjs) | JavaScript | 30 | 0 | 2 | 32 |
| [package.json](/package.json) | JSON | 48 | 0 | 1 | 49 |
| [src/main/db/blenderRepoPathRepo.js](/src/main/db/blenderRepoPathRepo.js) | JavaScript | 57 | 1 | 6 | 64 |
| [src/main/db/db.js](/src/main/db/db.js) | JavaScript | 78 | 1 | 6 | 85 |
| [src/main/db/index.js](/src/main/db/index.js) | JavaScript | 12 | 0 | 2 | 14 |
| [src/main/db/installedBlenderVersionRepo.js](/src/main/db/installedBlenderVersionRepo.js) | JavaScript | 75 | 1 | 6 | 82 |
| [src/main/db/launchArgumentRepo.js](/src/main/db/launchArgumentRepo.js) | JavaScript | 69 | 1 | 6 | 76 |
| [src/main/db/projectFileRepo.js](/src/main/db/projectFileRepo.js) | JavaScript | 69 | 1 | 6 | 76 |
| [src/main/db/pythonScriptRepo.js](/src/main/db/pythonScriptRepo.js) | JavaScript | 57 | 1 | 6 | 64 |
| [src/main/index.js](/src/main/index.js) | JavaScript | 248 | 29 | 48 | 325 |
| [src/main/ipc/blenderVersion/handlers.js](/src/main/ipc/blenderVersion/handlers.js) | JavaScript | 373 | 128 | 14 | 515 |
| [src/main/ipc/fileSystemUtility/handlers.js](/src/main/ipc/fileSystemUtility/handlers.js) | JavaScript | 194 | 99 | 15 | 308 |
| [src/main/ipc/index.js](/src/main/ipc/index.js) | JavaScript | 74 | 0 | 2 | 76 |
| [src/main/ipc/launchArgument/handlers.js](/src/main/ipc/launchArgument/handlers.js) | JavaScript | 88 | 37 | 5 | 130 |
| [src/main/ipc/projectFile/consts.js](/src/main/ipc/projectFile/consts.js) | JavaScript | 2 | 0 | 1 | 3 |
| [src/main/ipc/projectFile/handlers.js](/src/main/ipc/projectFile/handlers.js) | JavaScript | 278 | 92 | 9 | 379 |
| [src/main/ipc/pythonScript/handlers.js](/src/main/ipc/pythonScript/handlers.js) | JavaScript | 62 | 27 | 4 | 93 |
| [src/main/models/BlenderRepoPath.js](/src/main/models/BlenderRepoPath.js) | JavaScript | 17 | 0 | 1 | 18 |
| [src/main/models/DownloadableBlenderVersion.js](/src/main/models/DownloadableBlenderVersion.js) | JavaScript | 37 | 0 | 1 | 38 |
| [src/main/models/InstalledBlenderVersion.js](/src/main/models/InstalledBlenderVersion.js) | JavaScript | 25 | 0 | 1 | 26 |
| [src/main/models/LaunchArgument.js](/src/main/models/LaunchArgument.js) | JavaScript | 21 | 0 | 1 | 22 |
| [src/main/models/ProjectFile.js](/src/main/models/ProjectFile.js) | JavaScript | 21 | 0 | 1 | 22 |
| [src/main/models/PythonScript.js](/src/main/models/PythonScript.js) | JavaScript | 15 | 0 | 1 | 16 |
| [src/main/models/index.js](/src/main/models/index.js) | JavaScript | 6 | 0 | 1 | 7 |
| [src/preload/index.js](/src/preload/index.js) | JavaScript | 96 | 14 | 10 | 120 |
| [src/renderer/index.html](/src/renderer/index.html) | HTML | 15 | 1 | 2 | 18 |
| [src/renderer/src/App.jsx](/src/renderer/src/App.jsx) | JavaScript JSX | 33 | 0 | 8 | 41 |
| [src/renderer/src/components/TitleBar/TitleBar.css](/src/renderer/src/components/TitleBar/TitleBar.css) | PostCSS | 19 | 0 | 3 | 22 |
| [src/renderer/src/components/TitleBar/TitleBar.jsx](/src/renderer/src/components/TitleBar/TitleBar.jsx) | JavaScript JSX | 17 | 0 | 3 | 20 |
| [src/renderer/src/main.jsx](/src/renderer/src/main.jsx) | JavaScript JSX | 7 | 0 | 2 | 9 |
| [src/renderer/src/popup/CreateBlendPopup.jsx](/src/renderer/src/popup/CreateBlendPopup.jsx) | JavaScript JSX | 65 | 0 | 9 | 74 |
| [src/renderer/src/popup/DownloadPopup.jsx](/src/renderer/src/popup/DownloadPopup.jsx) | JavaScript JSX | 60 | 0 | 9 | 69 |
| [src/renderer/src/popup/LaunchBlendPopup.jsx](/src/renderer/src/popup/LaunchBlendPopup.jsx) | JavaScript JSX | 210 | 1 | 21 | 232 |
| [src/renderer/src/popup/LaunchBlenderPopup.jsx](/src/renderer/src/popup/LaunchBlenderPopup.jsx) | JavaScript JSX | 165 | 0 | 19 | 184 |
| [src/renderer/src/router.jsx](/src/renderer/src/router.jsx) | JavaScript JSX | 24 | 0 | 4 | 28 |
| [src/renderer/src/styles/main.css](/src/renderer/src/styles/main.css) | PostCSS | 82 | 0 | 20 | 102 |
| [src/renderer/src/utils/web.js](/src/renderer/src/utils/web.js) | JavaScript | 31 | 2 | 6 | 39 |
| [src/renderer/src/views/BlenderDownload.jsx](/src/renderer/src/views/BlenderDownload.jsx) | JavaScript JSX | 122 | 2 | 9 | 133 |
| [src/renderer/src/views/InstalledBlenderVersions.jsx](/src/renderer/src/views/InstalledBlenderVersions.jsx) | JavaScript JSX | 132 | 0 | 10 | 142 |
| [src/renderer/src/views/ProjectFiles.jsx](/src/renderer/src/views/ProjectFiles.jsx) | JavaScript JSX | 180 | 0 | 14 | 194 |
| [src/renderer/src/views/Settings.jsx](/src/renderer/src/views/Settings.jsx) | JavaScript JSX | 212 | 0 | 16 | 228 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)