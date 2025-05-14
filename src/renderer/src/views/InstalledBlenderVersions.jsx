import React, { useEffect, useRef, useState } from "react";

export default function InstalledBlenderVersions() {
    const [installedBlenderVersions, setInstalledBlenderVersions] = useState([]);
    const pendingLaunchVersionRef = useRef(null);

    useEffect(() => {
        loadInstalledBlenderVersions();

        const onLaunchBlenderInstanceRequested = async ({pythonScriptId, launchArgs}) => {
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
        } catch (e) {
            console.error("Failed to load installed Blender versions:", e);
        }
    };

    const handleSetDefault = async (selectedId) => {
        try {
            await window.api.updateInstalledBlenderVersion(selectedId, installedBlenderVersions.find((e) => e.id === selectedId).is_default);
            await loadInstalledBlenderVersions();
        } catch (e) {
            console.error("Failed to set default Blender version:", e);
        }
    };

    const handleDelete = async (selectedId) => {
        try {
            await window.api.uninstallAndDeleteInstalledBlenderVersionData(selectedId);
            await loadInstalledBlenderVersions();
        } catch (e) {
            console.error("Failed to delete Blender version:", e);
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
        } catch (e) {
            console.error("Failed to open launch popup:", e);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Installed Blender Versions</h1>
            <table className="w-full border-collapse border text-sm">
                <thead>
                    <tr>
                        <th className="border p-2">Version</th>
                        <th className="border p-2">Variant</th>
                        <th className="border p-2">Install Path</th>
                        <th className="border p-2">Executable</th>
                        <th className="border p-2">Created</th>
                        <th className="border p-2">Modified</th>
                        <th className="border p-2">Accessed</th>
                        <th className="border p-2">Default</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {installedBlenderVersions.map((entry) => (
                        <tr key={entry.id}>
                            <td className="border p-2">{entry.version}</td>
                            <td className="border p-2">{entry.variant_type}</td>
                            <td className="border p-2">{entry.installation_directory_path}</td>
                            <td className="border p-2">{entry.executable_file_path}</td>
                            <td className="border p-2">{entry.created}</td>
                            <td className="border p-2">{entry.modified}</td>
                            <td className="border p-2">{entry.accessed}</td>
                            <td className="border p-2 text-center">
                                <input
                                    type="checkbox"
                                    checked={entry.is_default}
                                    onChange={() => handleSetDefault(entry.id)}
                                />
                            </td>
                            <td className="border p-2 text-center space-x-2">
                                <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => handleLaunch(entry.id)}
                                >
                                    Launch
                                </button>
                                <button
                                    className="text-red-500 hover:underline"
                                    onClick={() => handleDelete(entry.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {installedBlenderVersions.length === 0 && (
                        <tr>
                            <td colSpan="9" className="text-center p-4">
                                No installed versions found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
