import React, { useEffect, useState } from "react";

const DownloadPopup = () => {
    const [repoPaths, setRepoPaths] = useState([]);

    useEffect(() => {
        loadPaths();
    }, []);

    const closeWindow = async () => {
        window.close(); 
    };

    const loadPaths = async () => {
        try {
            const paths = await window.api.fetchBlenderVersionInstallationLocations(null, null, null);
            setRepoPaths(paths);
        } catch (err) {
            setRepoPaths([]);
            console.error("Failed to fetch paths:", err);
        }
    };

    const handleSelect = async (path) => {
        try {
            await window.api.send("download-path-selected", { path });
            await closeWindow();
        } catch (err) {
            console.error("Failed to send path:", err);
        }
    };

    const handleUseDefault = async () => {
        try {
            await window.api.send("download-path-selected", { path: repoPaths.find((e) => e.is_default === true)?.repo_directory_path ? repoPaths.find((e) => e.is_default === true)?.repo_directory_path : repoPaths[0].repo_directory_path });
            await closeWindow();
        } catch (err) {
            console.error("Failed to send default path:", err);
        }
    };

    return (
        <div className="p-4">
            <h2 className="mb-2">Choose Download Location</h2>
            <button
                className="mb-2"
                onClick={handleUseDefault}
            >
                Use Default Directory {repoPaths?.find((e) => e?.is_default === true)?.repo_directory_path ? repoPaths?.find((e) => e?.is_default === true)?.repo_directory_path : repoPaths[0]?.repo_directory_path}
            </button>
            <h2 className="mb-2">Other</h2>
            <ul>
                {repoPaths.map((path) => (
                    <li key={path.id}>
                        <button
                            className="      "
                            onClick={() => handleSelect(path.repo_directory_path)}
                        >
                            {path.repo_directory_path}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DownloadPopup;
