import React, { useEffect, useState } from 'react'

const CreateBlendPopup = () => {
    const [installedBlenderVersions, setInstalledBlenderVersions] = useState([])
    const [fileName, setFileName] = useState('')
    const [selectedVersionId, setSelectedVersionId] = useState(null)

    useEffect(() => {
        loadInstalledBlenderVersions()
    }, [])

    const closeWindow = async () => {
        window.close()
    }

    const loadInstalledBlenderVersions = async () => {
        try {
            await window.api.insertAndRefreshInstalledBlenderVersions()
            const versions = await window.api.fetchInstalledBlenderVersions(null, null, null)
            setInstalledBlenderVersions(versions)
        } catch (err) {
            setInstalledBlenderVersions([])
            console.error('Failed to load installed Blender versions:', err)
        }
    }

    const handleCreate = async () => {
        if (!fileName || !selectedVersionId) return
        await window.api.send('create-project-file-confirmed', {
            fileName,
            versionId: selectedVersionId
        })
        await closeWindow()
    }

    return (
        <div className="p-4">
            <h2 className="mb-2">Create New .blend File</h2>
            <label className="mb-2">File Name</label>
            <input
                type="text"
                className="mb-4"
                placeholder="Enter file name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
            />
            <br />
            <label className="mb-2">Select Blender Version</label>
            <ul className="mb-4">
                {installedBlenderVersions.map((v) => (
                    <li key={v.id}>
                        <button
                            onClick={() => {
                                setSelectedVersionId(v.id)
                            }}
                        >
                            {v.version} {v.variant_type}
                        </button>
                    </li>
                ))}
            </ul>

            <div>
                <button onClick={closeWindow}>Cancel</button>
                <button onClick={handleCreate} disabled={!fileName || !selectedVersionId}>
                    Create
                </button>
            </div>
        </div>
    )
}

export default CreateBlendPopup
