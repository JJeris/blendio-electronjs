import React, { useEffect, useRef, useState } from "react";

export default function ProjectFiles() {
    const [projectFiles, setProjectFiles] = useState([]);
    const pendingOpenProjectRef = useRef(null);

    useEffect(() => {
        loadProjectFiles();

    }, []);

    const loadProjectFiles = async () => {
        try {
        } catch (e) {
            console.error("Failed to load .blend project files:", e);
        }
    };

    const handleOpen = async (id) => {
        pendingOpenProjectRef.current = id;
        try {
        } catch (e) {
            console.error("Failed to open .blend file:", e);
        }
    };

    const handleDelete = async (id) => {
        try {
        } catch (e) {
            console.error("Failed to delete .blend file:", e);
        }
    };

    const handleRevealInExplorer = async (id) => {
        try {
        } catch (e) {
            console.error("Failed to reveal .blend file:", e);
        }
    };

    const handleInsertIntoArchive = async (id) => {
        try {
        } catch (e) {
            console.error("Failed to insert .blend file into archive:", e);
        }
    };

    const handleCreateNewBlendFile = async () => {
        try {
        } catch (e) {
            console.error("Failed to open popup for creating new .blend file:", e);
        }
    };

    const handleInsertLaunchArgument = async (argumentString, projectFileId, pythonScriptId) => {
        try {
        } catch (e) {
            console.error("Failed to insert launch argument into the db", e);
        }
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">.blend Project Files</h1>
                <button
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                    onClick={handleCreateNewBlendFile}
                >
                    Create New .blend File
                </button>
            </div>

            <table className="w-full border-collapse border text-sm">
                <thead>
                    <tr>
                        <th className="border p-2">File Name</th>
                        <th className="border p-2">File Path</th>
                        <th className="border p-2">Series</th>
                        <th className="border p-2">Last Blender Version</th>
                        <th className="border p-2">Created</th>
                        <th className="border p-2">Modified</th>
                        <th className="border p-2">Accessed</th>
                        <th className="border p-2">Actions</th>
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
                                <td className="border p-2">{entry.file_name}</td>
                                <td className="border p-2">{entry.file_path}</td>
                                <td className="border p-2">
                                    {seriesList.length > 0 ? seriesList.join(", ") : "—"}
                                </td>
                                <td className="border p-2">
                                    {entry.last_used_blender_version_id ?? "N/A"}
                                </td>
                                <td className="border p-2">{entry.created}</td>
                                <td className="border p-2">{entry.modified}</td>
                                <td className="border p-2">{entry.accessed}</td>
                                <td className="border p-2 space-x-2 text-center">
                                    <button
                                        className="text-blue-600 hover:underline"
                                        onClick={() => handleOpen(entry.id)}
                                    >
                                        Open
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline"
                                        onClick={() => handleDelete(entry.id)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="text-gray-600 hover:underline"
                                        onClick={() => handleRevealInExplorer(entry.id)}
                                    >
                                        Reveal
                                    </button>
                                    <button
                                        className="text-purple-600 hover:underline"
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
                            <td colSpan="8" className="text-center p-4">
                                No project files found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
