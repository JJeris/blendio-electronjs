export async function downloadFile(url, filePath, buttonId) {
    const button = document.getElementById(buttonId)
    if (!button) return

    const originalText = button.textContent
    button.disabled = true
    button.textContent = 'Starting...'

    const progressHandler = ({ filePath: progressPath, percent }) => {
        if (progressPath === filePath) {
            const button = document.getElementById(buttonId);
            if (button) {
                button.textContent = `Downloading... ${percent}%`
                button.disabled = true
            }
        }
    }

    try {
        // Register per-download progress handler
        window.api.onDownloadProgress(progressHandler)

        await window.api.downloadFile(url, filePath)

        const finishedButton = document.getElementById(buttonId)
        if (finishedButton) {
            finishedButton.textContent = originalText
            finishedButton.disabled = false
        }
    } catch (err) {
        console.error("Download failed:", err);
        if (button) button.textContent = "Error";
    } finally {
        if (button) button.disabled = false;
        // Clean up the listener for this download
        window.api.removeDownloadProgressListener(progressHandler)
    }
}
