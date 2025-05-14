import React, { useEffect, useState } from "react";

const CreateBlendPopup = () => {
    const [installedBlenderVersions, setInstalledBlenderVersions] = useState([]);
    const [fileName, setFileName] = useState("");
    const [selectedVersionId, setSelectedVersionId] = useState(null);

    useEffect(() => {
        loadInstalledBlenderVersions();
    }, []);

    const closeWindow = async () => {
        window.close(); 
    };

    const loadInstalledBlenderVersions = async () => {
        try {
            await window.api.insertAndRefreshInstalledBlenderVersions();
            const versions = await window.api.fetchInstalledBlenderVersions(null, null, null);
            setInstalledBlenderVersions(versions);
        } catch (e) {
            console.error("Failed to load installed Blender versions:", e);
        }
    };

    const handleCreate = async () => {
        if (!fileName || !selectedVersionId) return;
        await window.api.send("create-project-file-confirmed", { 
            fileName, 
            versionId: selectedVersionId 
        });
        await closeWindow();
    };

    return (
        <div className="p-4 text-sm">
            <h2 className="text-lg font-bold mb-2">Create New .blend File</h2>
            <label className="block mb-2">File Name</label>
            <input
                type="text"
                className="w-full px-2 py-1 border rounded mb-4"
                placeholder="Enter file name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
            />

            <label className="block mb-2">Select Blender Version</label>
            <ul className="space-y-2 mb-4">
                {installedBlenderVersions.map((v) => (
                    <li key={v.id}>
                        <button
                            className={`w-full text-left px-2 py-1 border rounded hover:bg-gray-100 ${selectedVersionId === v.id ? "bg-blue-100 border-blue-400" : ""
                                }`}
                            onClick={() => {
                                    setSelectedVersionId(v.id)
                                }
                            }
                        >
                            {v.version} {v.variant_type}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="flex justify-end space-x-2">
                <button
                    onClick={closeWindow}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCreate}
                    disabled={!fileName || !selectedVersionId}
                    className={`px-4 py-2 rounded text-white ${fileName && selectedVersionId
                        ? "bg-blue-500"
                        : "bg-gray-400 cursor-not-allowed"
                        }`}
                >
                    Create
                </button>
            </div>
        </div>
    );
};

export default CreateBlendPopup;
