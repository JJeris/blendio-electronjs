import React, { useEffect, useRef, useState } from "react";

export default function InstalledBlenderVersions() {
    const [installedBlenderVersions, setInstalledBlenderVersions] = useState([]);
    const pendingLaunchVersionRef = useRef(null);

    useEffect(() => {
        loadInstalledBlenderVersions();

        const onLaunchBlenderInstanceRequested = async ({ pythonScriptId, launchArgs }) => {
            const versionId = pendingLaunchVersionRef.current;
            if (!versionId) {
                console.error("Missing versionId — did you forget to set the ref?");
                return;
            }

            let launchArgumentId = null;
            try {
                if (launchArgs && launchArgs.trim() !== "") {
                    launchArgumentId = await window.api.insertLaunchArgument(launchArgs.trim(), null, pythonScriptId || null);
                }
                await window.api.launchBlenderVersionWithLaunchArgs(versionId, launchArgumentId || null, pythonScriptId || null);
                await loadInstalledBlenderVersions();
            } catch (err) {
                console.error("Failed to launch Blender version from popup:", err);
            } finally {
                pendingLaunchVersionRef.current = null;
            }
        };
        window.api.receive("launch-blender-instance-requested", onLaunchBlenderInstanceRequested);
        return () => {
            window.api.removeEventListener("launch-blender-instance-requested", onLaunchBlenderInstanceRequested);
        };
    }, []);

    const loadInstalledBlenderVersions = async () => {
        try {
            await window.api.insertAndRefreshInstalledBlenderVersions();
            const versions = await window.api.fetchInstalledBlenderVersions(null, null, null);
            setInstalledBlenderVersions(versions);
        } catch (err) {
            setInstalledBlenderVersions([]);
            console.error("Failed to load installed Blender versions:", err);
        }
    };

    const handleSetDefault = async (selectedId) => {
        try {
            await window.api.updateInstalledBlenderVersion(selectedId, installedBlenderVersions.find((e) => e.id === selectedId).is_default);
            await loadInstalledBlenderVersions();
        } catch (err) {
            await loadInstalledBlenderVersions();
            console.error("Failed to set default Blender version:", err);
        }
    };

    const handleDelete = async (selectedId) => {
        try {
            await window.api.uninstallAndDeleteInstalledBlenderVersionData(selectedId);
            await loadInstalledBlenderVersions();
        } catch (err) {
            await loadInstalledBlenderVersions();
            console.error("Failed to delete Blender version:", err);
        }
    };

    const handleLaunch = async (id) => {
        pendingLaunchVersionRef.current = id;
        try {
            window.api.instancePopupWindow(
                "launch-blender-version-popup",
                "Launch Blender Version",
                "popup/LaunchBlenderPopup"
            );
        } catch (err) {
            await loadInstalledBlenderVersions();
            console.error("Failed to open launch popup:", err);
        }
    };

    return (
        <div className="p-4">
            <h1 className="mb-4">Installed Blender Versions</h1>
            <table className="border-collapse">
                <thead>
                    <tr>
                        <th className="p-2">Version</th>
                        <th className="p-2">Variant</th>
                        <th className="p-2">Installation Path</th>
                        <th className="p-2">Executable file path</th>
                        <th className="p-2">Created</th>
                        <th className="p-2">Modified</th>
                        <th className="p-2">Accessed</th>
                        <th className="p-2">Default</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {installedBlenderVersions.map((entry) => (
                        <tr key={entry.id}>
                            <td className="p-2">{entry.version}</td>
                            <td className="p-2">{entry.variant_type}</td>
                            <td className="p-2">{entry.installation_directory_path}</td>
                            <td className="p-2">{entry.executable_file_path}</td>
                            <td className="p-2">{entry.created}</td>
                            <td className="p-2">{entry.modified}</td>
                            <td className="p-2">{entry.accessed}</td>
                            <td className="p-2 ">
                                <input
                                    type="checkbox"
                                    checked={entry.is_default}
                                    onChange={() => handleSetDefault(entry.id)}
                                />
                            </td>
                            <td className="p-2">
                                <button
                                    onClick={() => handleLaunch(entry.id)}
                                >
                                    Launch
                                </button>
                                <button
                                    className="text-red-500"
                                    onClick={() => handleDelete(entry.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {installedBlenderVersions.length === 0 && (
                        <tr>
                            <td colSpan="9" className="p-4">
                                No installed versions found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
