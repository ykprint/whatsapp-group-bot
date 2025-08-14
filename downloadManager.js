const YTDlpWrap = require('yt-dlp-wrap').default;
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const Utils = require('./utils');
const config = require('./config');

class DownloadManager {
    constructor() {
        this.ytDlp = new YTDlpWrap();
        this.activeDownloads = new Map(); // groupId -> Set of download processes
        this.downloadProgress = new Map(); // downloadId -> progress info
    }

    async initialize() {
        try {
            await Utils.ensureDirectories();
            
            // Try to check if yt-dlp is available
            try {
                await this.ytDlp.getVersion();
                console.log('✅ yt-dlp is available');
            } catch (error) {
                console.log('⚠️  yt-dlp not found in PATH. Downloads may not work until yt-dlp is installed.');
                console.log('   Download from: https://github.com/yt-dlp/yt-dlp/releases');
            }
            
            console.log('✅ Download manager initialized');
        } catch (error) {
            console.error('❌ Failed to initialize download manager:', error);
        }
    }

    getGroupDownloads(groupId) {
        if (!this.activeDownloads.has(groupId)) {
            this.activeDownloads.set(groupId, new Set());
        }
        return this.activeDownloads.get(groupId);
    }

    addDownload(groupId, downloadId) {
        const downloads = this.getGroupDownloads(groupId);
        downloads.add(downloadId);
    }

    removeDownload(groupId, downloadId) {
        const downloads = this.getGroupDownloads(groupId);
        downloads.delete(downloadId);
        this.downloadProgress.delete(downloadId);
    }

    stopAllDownloads(groupId) {
        const downloads = this.getGroupDownloads(groupId);
        const count = downloads.size;
        
        // Clear all downloads for this group
        downloads.clear();
        
        // Clear progress tracking
        for (const [downloadId, progress] of this.downloadProgress.entries()) {
            if (progress.groupId === groupId) {
                this.downloadProgress.delete(downloadId);
            }
        }
        
        return count;
    }

    async downloadYouTubeAudio(url, groupId, progressCallback) {
        const downloadId = `${groupId}_${Date.now()}`;
        const outputTemplate = path.join(config.DOWNLOADS_DIR, `%(title)s_${downloadId}.%(ext)s`);

        try {
            this.addDownload(groupId, downloadId);
            
            const options = [
                '--extract-audio',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '--output', outputTemplate,
                '--no-playlist'
            ];
            
            // Only add ffmpeg options if ffmpeg is available
            try {
                const { spawn } = require('child_process');
                const ffmpegTest = spawn('ffmpeg', ['-version'], { stdio: 'ignore' });
                ffmpegTest.on('close', (code) => {
                    if (code === 0) {
                        options.push('--external-downloader', 'ffmpeg');
                        options.push('--external-downloader-args', `ffmpeg:-threads ${config.PARALLEL_FRAGMENTS}`);
                        options.push('--prefer-ffmpeg');
                        options.push('--embed-thumbnail');
                    }
                });
            } catch (error) {
                console.log('FFmpeg not available, using built-in downloader');
            }

            let fileName = null;
            const process = this.ytDlp.exec(url, options);
            
            process.on('progress', (progress) => {
                if (this.getGroupDownloads(groupId).has(downloadId)) {
                    this.downloadProgress.set(downloadId, { ...progress, groupId });
                    if (progressCallback) progressCallback(progress);
                }
            });

            process.on('ytDlpEvent', (eventType, eventData) => {
                if (eventType === 'progress' && eventData.filename) {
                    fileName = eventData.filename;
                }
            });

            await process;
            this.removeDownload(groupId, downloadId);

            // Find the downloaded file
            const files = await fs.readdir(config.DOWNLOADS_DIR);
            const downloadedFile = files.find(file => file.includes(downloadId));
            
            if (downloadedFile) {
                const filePath = path.join(config.DOWNLOADS_DIR, downloadedFile);
                Utils.deleteFileAfterDelay(filePath);
                return filePath;
            }

            throw new Error('Downloaded file not found');
        } catch (error) {
            this.removeDownload(groupId, downloadId);
            throw error;
        }
    }

    async downloadYouTubeVideo(url, quality = '720p', groupId, progressCallback) {
        const downloadId = `${groupId}_${Date.now()}`;
        const outputTemplate = path.join(config.DOWNLOADS_DIR, `%(title)s_${downloadId}.%(ext)s`);

        try {
            this.addDownload(groupId, downloadId);
            
            const formatSelector = this.getFormatSelector(quality);
            const options = [
                '--format', formatSelector,
                '--external-downloader', 'ffmpeg',
                '--external-downloader-args', `ffmpeg:-threads ${config.PARALLEL_FRAGMENTS}`,
                '--output', outputTemplate,
                '--no-playlist',
                '--merge-output-format', 'mp4'
            ];

            const process = this.ytDlp.exec(url, options);
            
            process.on('progress', (progress) => {
                if (this.getGroupDownloads(groupId).has(downloadId)) {
                    this.downloadProgress.set(downloadId, { ...progress, groupId });
                    if (progressCallback) progressCallback(progress);
                }
            });

            await process;
            this.removeDownload(groupId, downloadId);

            // Find the downloaded file
            const files = await fs.readdir(config.DOWNLOADS_DIR);
            const downloadedFile = files.find(file => file.includes(downloadId));
            
            if (downloadedFile) {
                const filePath = path.join(config.DOWNLOADS_DIR, downloadedFile);
                Utils.deleteFileAfterDelay(filePath);
                return filePath;
            }

            throw new Error('Downloaded file not found');
        } catch (error) {
            this.removeDownload(groupId, downloadId);
            throw error;
        }
    }

    async downloadFromSite(url, type = 'video', quality = 'best', groupId, progressCallback) {
        const downloadId = `${groupId}_${Date.now()}`;
        const outputTemplate = path.join(config.DOWNLOADS_DIR, `%(title)s_${downloadId}.%(ext)s`);

        try {
            this.addDownload(groupId, downloadId);
            
            let options = [
                '--external-downloader', 'ffmpeg',
                '--external-downloader-args', `ffmpeg:-threads ${config.PARALLEL_FRAGMENTS}`,
                '--output', outputTemplate,
                '--no-playlist'
            ];

            if (type === 'audio') {
                options.push(
                    '--extract-audio',
                    '--audio-format', 'mp3',
                    '--audio-quality', '0'
                );
            } else {
                const formatSelector = this.getFormatSelector(quality);
                options.push('--format', formatSelector);
                options.push('--merge-output-format', 'mp4');
            }

            const process = this.ytDlp.exec(url, options);
            
            process.on('progress', (progress) => {
                if (this.getGroupDownloads(groupId).has(downloadId)) {
                    this.downloadProgress.set(downloadId, { ...progress, groupId });
                    if (progressCallback) progressCallback(progress);
                }
            });

            await process;
            this.removeDownload(groupId, downloadId);

            // Find the downloaded file
            const files = await fs.readdir(config.DOWNLOADS_DIR);
            const downloadedFile = files.find(file => file.includes(downloadId));
            
            if (downloadedFile) {
                const filePath = path.join(config.DOWNLOADS_DIR, downloadedFile);
                Utils.deleteFileAfterDelay(filePath);
                return filePath;
            }

            throw new Error('Downloaded file not found');
        } catch (error) {
            this.removeDownload(groupId, downloadId);
            throw error;
        }
    }

    async downloadWithBassBoost(url, bassLevel = 10, groupId, progressCallback) {
        const downloadId = `${groupId}_${Date.now()}`;
        const outputTemplate = path.join(config.DOWNLOADS_DIR, `%(title)s_bass${bassLevel}_${downloadId}.%(ext)s`);

        try {
            this.addDownload(groupId, downloadId);
            
            // Bass boost filter for FFmpeg
            const bassFilter = `bass=g=${bassLevel}`;
            
            const options = [
                '--extract-audio',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '--postprocessor-args', `ffmpeg:-af ${bassFilter}`,
                '--external-downloader', 'ffmpeg',
                '--external-downloader-args', `ffmpeg:-threads ${config.PARALLEL_FRAGMENTS}`,
                '--output', outputTemplate,
                '--no-playlist'
            ];

            const process = this.ytDlp.exec(url, options);
            
            process.on('progress', (progress) => {
                if (this.getGroupDownloads(groupId).has(downloadId)) {
                    this.downloadProgress.set(downloadId, { ...progress, groupId });
                    if (progressCallback) progressCallback(progress);
                }
            });

            await process;
            this.removeDownload(groupId, downloadId);

            // Find the downloaded file
            const files = await fs.readdir(config.DOWNLOADS_DIR);
            const downloadedFile = files.find(file => file.includes(downloadId));
            
            if (downloadedFile) {
                const filePath = path.join(config.DOWNLOADS_DIR, downloadedFile);
                Utils.deleteFileAfterDelay(filePath);
                return filePath;
            }

            throw new Error('Downloaded file not found');
        } catch (error) {
            this.removeDownload(groupId, downloadId);
            throw error;
        }
    }

    async downloadWithSpeedControl(url, speed = 1.0, groupId, progressCallback) {
        const downloadId = `${groupId}_${Date.now()}`;
        const outputTemplate = path.join(config.DOWNLOADS_DIR, `%(title)s_speed${speed}x_${downloadId}.%(ext)s`);

        try {
            this.addDownload(groupId, downloadId);
            
            // Speed control filter for FFmpeg
            const speedFilter = `atempo=${speed}`;
            
            const options = [
                '--extract-audio',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '--postprocessor-args', `ffmpeg:-af ${speedFilter}`,
                '--external-downloader', 'ffmpeg',
                '--external-downloader-args', `ffmpeg:-threads ${config.PARALLEL_FRAGMENTS}`,
                '--output', outputTemplate,
                '--no-playlist'
            ];

            const process = this.ytDlp.exec(url, options);
            
            process.on('progress', (progress) => {
                if (this.getGroupDownloads(groupId).has(downloadId)) {
                    this.downloadProgress.set(downloadId, { ...progress, groupId });
                    if (progressCallback) progressCallback(progress);
                }
            });

            await process;
            this.removeDownload(groupId, downloadId);

            // Find the downloaded file
            const files = await fs.readdir(config.DOWNLOADS_DIR);
            const downloadedFile = files.find(file => file.includes(downloadId));
            
            if (downloadedFile) {
                const filePath = path.join(config.DOWNLOADS_DIR, downloadedFile);
                Utils.deleteFileAfterDelay(filePath);
                return filePath;
            }

            throw new Error('Downloaded file not found');
        } catch (error) {
            this.removeDownload(groupId, downloadId);
            throw error;
        }
    }

    getFormatSelector(quality) {
        switch (quality.toLowerCase()) {
            case '144p': return 'worst[height<=144]/worst';
            case '240p': return 'best[height<=240]/best';
            case '360p': return 'best[height<=360]/best';
            case '480p': return 'best[height<=480]/best';
            case '720p': return 'best[height<=720]/best';
            case '1080p': return 'best[height<=1080]/best';
            default: return 'best[height<=720]/best';
        }
    }

    async searchYouTube(query) {
        try {
            const options = [
                '--dump-json',
                '--flat-playlist',
                '--playlist-end', '5',
                `ytsearch5:${query}`
            ];

            const searchResults = await this.ytDlp.execPromise(options);
            const results = searchResults.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(result => result && result.title);

            return results.slice(0, 5);
        } catch (error) {
            console.error('YouTube search error:', error);
            return [];
        }
    }

    getActiveDownloadsCount(groupId) {
        return this.getGroupDownloads(groupId).size;
    }

    getAllActiveDownloads() {
        let total = 0;
        for (const downloads of this.activeDownloads.values()) {
            total += downloads.size;
        }
        return total;
    }
}

module.exports = DownloadManager;
