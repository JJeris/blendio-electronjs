import React, { useEffect, useRef, useState } from "react";

export default function ProjectFiles() {
    const [projectFiles, setProjectFiles] = useState([]);
    const pendingOpenProjectRef = useRef(null);

    useEffect(() => {
        loadProjectFiles();
        const onCreateProjectFileConfirmed = async ({fileName, versionId}) => {
            try {
                await window.api.createNewProjectFile(versionId, fileName);
                await loadProjectFiles();
            } catch (err) {
                await loadProjectFiles();
                console.error("Failed to create new project file from popup:", err);
            }
        };
        const onOpenProjectFileConfirmed = async ({versionId, pythonScriptId, launchArgs}) => {
            const projectFileId = pendingOpenProjectRef.current;
            if (!projectFileId) {
                console.error("Missing projectFileId — did you forget to set the ref?");
                return;
            }

            let launchArgumentId = null;
            try {
                if (launchArgs && launchArgs.trim() !== "") {
                    launchArgumentId = await window.api.insertLaunchArgument(launchArgs.trim(), projectFileId, pythonScriptId || null);
                }
                await window.api.openBlendFile(projectFileId, versionId, launchArgumentId || null, pythonScriptId || null);
            } catch (err) {
                console.error("Failed to launch Blender version from popup:", err);
            } finally {
                await loadProjectFiles();
                pendingOpenProjectRef.current = null;
            }
        };
        window.api.receive("create-project-file-confirmed", onCreateProjectFileConfirmed);
        window.api.receive("open-project-file-confirmed", onOpenProjectFileConfirmed);
        return () => {
            window.api.removeEventListener("create-project-file-confirmed", onCreateProjectFileConfirmed);
            window.api.removeEventListener("open-project-file-confirmed", onOpenProjectFileConfirmed);
        };
    }, []);

    const loadProjectFiles = async () => {
        try {
            await window.api.insertAndRefreshBlendFiles();
            const files = await window.api.fetchBlendFiles(null, null, null);
            setProjectFiles(files);
        } catch (err) {
            setProjectFiles([]);
            console.error("Failed to load .blend project files:", err);
        }
    };

    const handleOpen = async (id) => {
        pendingOpenProjectRef.current = id;
        try {
            window.api.instancePopupWindow(
                "launch-project-file-popup",
                "Launch Project File",
                "popup/LaunchBlendPopup",
            );
        } catch (err) {
            loadProjectFiles();
            console.error("Failed to open .blend file:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await window.api.deleteBlendFile(id);
            await loadProjectFiles();
        } catch (err) {
            await loadProjectFiles();
            console.error("Failed to delete .blend file:", err);
        }
    };

    const handleRevealInExplorer = async (id) => {
        try {
            await window.api.revealProjectFileInLocalFileSystem(id);
        } catch (err) {
            await loadProjectFiles();
            console.error("Failed to reveal .blend file:", err);
        }
    };

    const handleInsertIntoArchive = async (id) => {
        try {
            await window.api.createProjectFileArchiveFile(id);
        } catch (err) {
            await loadProjectFiles();
            console.error("Failed to insert .blend file into archive:", err);
        }
    };

    const handleCreateNewBlendFile = async () => {
        try {
            window.api.instancePopupWindow(
                "create-new-project-file-popup",
                "Create New Project File",
                "popup/CreateBlendPopup",
            );
        } catch (err) {
            await loadProjectFiles();
            console.error("Failed to open popup for creating new .blend file:", err);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <h1 >Project Files</h1>
                <button
                    className="mt-2 bg-green-500"
                    onClick={handleCreateNewBlendFile}
                >
                    Create New .blend File
                </button>
            </div>

            <table className="border-collapse">
                <thead>
                    <tr>
                        <th className="p-2">File Name</th>
                        <th className="p-2">File Path</th>
                        <th className="p-2">Associated Blender Series</th>
                        <th className="p-2">Created</th>
                        <th className="p-2">Modified</th>
                        <th className="p-2">Accessed</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {projectFiles.map((entry) => {
                        let seriesList = [];

                        try {
                            seriesList = JSON.parse(entry.associated_series_json);
                        } catch {
                            seriesList = [];
                        }

                        return (
                            <tr key={entry.id}>
                                <td className="p-2">{entry.file_name}</td>
                                <td className="p-2">{entry.file_path}</td>
                                <td className="p-2">
                                    {seriesList.length > 0 ? seriesList.join(", ") : "—"}
                                </td>
                                <td className="p-2">{entry.created}</td>
                                <td className="p-2">{entry.modified}</td>
                                <td className="p-2">{entry.accessed}</td>
                                <td className="p-2">
                                    <button
                                        onClick={() => handleOpen(entry.id)}
                                    >
                                        Open
                                    </button>
                                    <button
                                        className="text-red-500"
                                        onClick={() => handleDelete(entry.id)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => handleRevealInExplorer(entry.id)}
                                    >
                                        Reveal
                                    </button>
                                    <button
                                        onClick={() => handleInsertIntoArchive(entry.id)}
                                    >
                                        Archive
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {projectFiles.length === 0 && (
                        <tr>
                            <td colSpan="8" className="p-4">
                                No project files found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
