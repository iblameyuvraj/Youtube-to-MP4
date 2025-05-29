document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const urlInput = document.getElementById('youtube-url');
    const downloadBtn = document.getElementById('download-btn');
    const previewContainer = document.getElementById('preview-container');
    const videoThumb = document.getElementById('video-thumb');
    const videoTitle = document.getElementById('video-title');
    const videoChannel = document.getElementById('video-channel');
    const videoDuration = document.getElementById('video-duration');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const statusMessage = document.getElementById('status-message');
    const downloadsGrid = document.getElementById('downloads-grid');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // Base URL for the backend API
    const API_BASE = 'http://localhost:5000';
    
    // Helper functions
    function isValidYouTubeUrl(url) {
        const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        return regExp.test(url);
    }
    
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message';
        
        if (type === 'success') {
            statusMessage.classList.add('status-success');
        } else if (type === 'error') {
            statusMessage.classList.add('status-error');
        }
        
        statusMessage.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
    
    async function getVideoInfo(url) {
        try {
            const response = await fetch(`${API_BASE}/api/video-info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            
            if (!response.ok) {
                throw new Error('Failed to get video info');
            }
            
            return await response.json();
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
            return null;
        }
    }
    
    async function startDownload(url) {
        try {
            const response = await fetch(`${API_BASE}/api/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Download failed');
            }
            
            return await response.json();
        } catch (error) {
            showStatus(`Download error: ${error.message}`, 'error');
            return null;
        }
    }
    
    function showPreview(info) {
        videoThumb.src = info.thumbnail;
        videoTitle.textContent = info.title;
        videoChannel.textContent = info.channel;
        videoDuration.textContent = `Duration: ${info.duration}`;
        previewContainer.style.display = 'flex';
    }
    
    function updateProgress(progress) {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Downloading... ${Math.round(progress)}%`;
        
        if (progress >= 100) {
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressText.style.display = 'none';
                previewContainer.style.display = 'none';
            }, 1000);
        }
    }
    
    function simulateProgress() {
        progressContainer.style.display = 'block';
        progressText.style.display = 'block';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            updateProgress(progress);
        }, 300);
    }
    
    function refreshDownloads() {
        // In a real app, this would fetch actual downloads from the backend
        downloadsGrid.innerHTML = '';
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        
        setTimeout(() => {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            addDownloadItem(
                'Rick Astley - Never Gonna Give You Up', 
                '03:32', 
                '128 MB', 
                'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
            );
        }, 1000);
    }
    
    function addDownloadItem(title, duration, size, thumb) {
        const downloadItem = document.createElement('div');
        downloadItem.className = 'download-card';
        downloadItem.innerHTML = `
            <div class="download-thumb">
                <img src="${thumb}" alt="${title}">
            </div>
            <div class="download-info">
                <h3>${title}</h3>
                <div class="download-meta">
                    <span><i class="far fa-clock"></i> ${duration}</span>
                    <span><i class="fas fa-weight-hanging"></i> ${size}</span>
                </div>
                <div class="download-actions">
                    <button class="download-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="download-btn delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        downloadsGrid.appendChild(downloadItem);
    }
    
    // Event listeners
    downloadBtn.addEventListener('click', async function() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showStatus('Please enter a YouTube URL', 'error');
            return;
        }
        
        if (!isValidYouTubeUrl(url)) {
            showStatus('Please enter a valid YouTube URL', 'error');
            return;
        }
        
        // Show loading state
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            // Get video info
            const info = await getVideoInfo(url);
            if (!info) return;
            
            // Show preview
            showPreview(info);
            
            // Start download
            const result = await startDownload(url);
            if (!result) return;
            
            // Simulate progress (in a real app, you'd use WebSockets for real progress)
            simulateProgress();
            
            // Show success message
            setTimeout(() => {
                showStatus('Video downloaded successfully!', 'success');
                refreshDownloads();
            }, 5000);
            
        } catch (error) {
            showStatus(error.message, 'error');
        } finally {
            // Reset button
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        }
    });
    
    refreshBtn.addEventListener('click', function() {
        refreshDownloads();
    });
    
    // Initialize with some downloads for demo
    refreshDownloads();
});