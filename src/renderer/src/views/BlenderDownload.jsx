/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from "react";
import { downloadFile } from "../utils/web";

export default function BlenderDownload() {
    const [isOnline, setIsOnline] = useState(false);
    const [downloadableBuilds, setDownloadableBuilds] = useState([]);
    const pendingDownloadRef = useRef(null);

    useEffect(() => {
        const initializeView = async () => {
            const isActiveInternetConnection = await checkInternetConnection();
            setIsOnline(isActiveInternetConnection);
            if (isActiveInternetConnection === true) {
                await loadBlenderBuilds();
            }
        }
        initializeView();
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

    const checkInternetConnection = async () => {
        try {
            return await window.api.identifyInternetConnection();
        } catch (err) {
            console.error("Failed to identify internet connection:", err);
        }
    }

    const loadBlenderBuilds = async () => {
        try {
            const builds = await window.api.getDownloadableBlenderVersionData();
            setDownloadableBuilds(builds);
        } catch (err) {
            setDownloadableBuilds([]);
            console.error("Failed to fetch downloadable blender versions:", err);
        }
    };

    const handleOpenPopup = async () => {
        try {
            window.api.instancePopupWindow(
                "download-popup",
                "Choose Download Location",
                "popup/DownloadPopup"
            );
        } catch (err) {
            console.error("Failed to open popup:", err);
        }
    };

    const download = async (build, url, fileName, buttonId) => {
        pendingDownloadRef.current = { build, url, fileName, buttonId };
        try {
            await handleOpenPopup();
        } catch (err) {
            console.error("Failed to open popup:", err);
        }
    };

    return (
        <div className="p-4">
            <h1 className="mb-4">Blender Download (Daily Builds)</h1>
            <div>
                Internet connection status:{" "}
                <span className={isOnline ? "text-green-500" : "text-red-500"}>
                    {isOnline ? "Online" : "Offline, check connection and reload the page"}
                </span>
            </div>
            <br />
            <table className="border-collapse">
                <thead>
                    <tr>
                        <th className="p-2">Version</th>
                        <th className="p-2">Risk</th>
                        <th className="p-2">Branch</th>
                        <th className="p-2">Platform</th>
                        <th className="p-2">Arch</th>
                        <th className="p-2">Bit</th>
                        <th className="p-2">Extension</th>
                        <th className="p-2">Size</th>
                        <th className="p-2">Download</th>
                    </tr>
                </thead>
                <tbody>
                    {downloadableBuilds.map((build, index) => {
                        const buttonId = `download-btn-${build.file_name}`;
                        return (
                            <tr key={index}>
                                <td className="p-2">{build.version}</td>
                                <td className="p-2">{build.risk_id}</td>
                                <td className="p-2">{build.branch}</td>
                                <td className="p-2">{build.platform}</td>
                                <td className="p-2">{build.architecture}</td>
                                <td className="p-2">{build.bitness}</td>
                                <td className="p-2">{build.file_extension}</td>
                                <td className="p-2">{(build.file_size / (1024 * 1024)).toFixed(2)} MB</td>
                                <td className="p-2">
                                    <button
                                        id={buttonId}
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
                            <td colSpan="10" className="p-4">No builds found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
