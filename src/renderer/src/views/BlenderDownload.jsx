import React, { useEffect, useRef, useState } from "react";
import { downloadFile } from "../utils/web";

export default function BlenderDownload() {
    const [downloadableBuilds, setDownloadableBuilds] = useState([]);
    const pendingDownloadRef = useRef(null);

    useEffect(() => {
        loadBlenderBuilds();

        const onPathSelected = async ({ path }) => {
            const pending = pendingDownloadRef.current;
            if (path && pending) {
                const { build, url, fileName, buttonId } = pending;
                pendingDownloadRef.current = null;
                await downloadFile(url, `${path}\\${fileName}`, buttonId);
                await window.api.downloadAndInstallBlenderVersion(`${path}\\${fileName}`, build);
            }
        };

        window.api.receive("download-path-selected", onPathSelected);
        return () => {
            window.api.removeEventListener("download-path-selected", onPathSelected);
        };
    }, []);

    const loadBlenderBuilds = async () => {
        try {
            const builds = await window.api.getDownloadableBlenderVersionData();
            setDownloadableBuilds(builds);
        } catch (e) {
            console.error("Failed to fetch downloadable blender versions:", e);
        }
    };

    const handleOpenPopup = async () => {
        try {
            window.api.instancePopupWindow(
                "download-popup",
                "Choose Download Location",
                "popup/DownloadPopup"
            );
        } catch (e) {
            console.error("Failed to open popup:", e);
        }
    };

    const download = async (build, url, fileName, buttonId) => {
        pendingDownloadRef.current = { build, url, fileName, buttonId };
        try {
            await handleOpenPopup();
        } catch (error) {
            console.error("Failed to open popup:", error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Blender Daily Builds</h1>
            <table className="w-full border-collapse border text-sm">
                <thead>
                    <tr>
                        <th className="border p-2">Version</th>
                        <th className="border p-2">App</th>
                        <th className="border p-2">Risk</th>
                        <th className="border p-2">Branch</th>
                        <th className="border p-2">Platform</th>
                        <th className="border p-2">Arch</th>
                        <th className="border p-2">Bit</th>
                        <th className="border p-2">Extension</th>
                        <th className="border p-2">Size</th>
                        <th className="border p-2">Download</th>
                    </tr>
                </thead>
                <tbody>
                    {downloadableBuilds.map((build, index) => {
                        const buttonId = `download-btn-${build.file_name}`;
                        return (
                            <tr key={index}>
                                <td className="border p-2">{build.version}</td>
                                <td className="border p-2">{build.app}</td>
                                <td className="border p-2">{build.risk_id}</td>
                                <td className="border p-2">{build.branch}</td>
                                <td className="border p-2">{build.platform}</td>
                                <td className="border p-2">{build.architecture}</td>
                                <td className="border p-2">{build.bitness}</td>
                                <td className="border p-2">{build.file_extension}</td>
                                <td className="border p-2">{build.file_size}</td>
                                <td className="border p-2">
                                    <button
                                        id={buttonId}
                                        className="bg-blue-600 text-white px-4 py-2 rounded"
                                        onClick={() => download(build, build.url, build.file_name, buttonId)}
                                    >
                                        Download
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {downloadableBuilds.length === 0 && (
                        <tr>
                            <td colSpan="10" className="text-center p-4">No builds found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
