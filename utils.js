const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const config = require('./config');

class Utils {
    static async ensureDirectories() {
        await fs.ensureDir(config.DOWNLOADS_DIR);
        await fs.ensureDir(config.TEMP_DIR);
    }

    static async cleanupOldFiles() {
        try {
            const directories = [config.DOWNLOADS_DIR, config.TEMP_DIR];
            const cutoffTime = Date.now() - (config.FILE_RETENTION_HOURS * 60 * 60 * 1000);

            for (const dir of directories) {
                if (await fs.pathExists(dir)) {
                    const files = await fs.readdir(dir);
                    
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        const stats = await fs.stat(filePath);
                        
                        if (stats.mtime.getTime() < cutoffTime) {
                            await fs.remove(filePath);
                            console.log(`🗑️ Cleaned up old file: ${file}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static formatDuration(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    static async getRandomJoke() {
        try {
            const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
            const joke = response.data;
            return `😄 *Random Joke*\n\n${joke.setup}\n\n*${joke.punchline}*`;
        } catch (error) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "Why don't eggs tell jokes? They'd crack each other up!",
                "What do you call a fake noodle? An impasta!",
                "Why did the math book look so sad? Because it was full of problems!"
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            return `😄 *Random Joke*\n\n${randomJoke}`;
        }
    }

    static async getWordDefinition(word) {
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = response.data[0];
            
            let definition = `📚 *Definition of "${word}"*\n\n`;
            definition += `**Phonetic:** ${data.phonetic || 'N/A'}\n\n`;
            
            data.meanings.forEach((meaning, index) => {
                if (index < 2) { // Limit to first 2 meanings
                    definition += `**${meaning.partOfSpeech}:**\n`;
                    meaning.definitions.slice(0, 2).forEach((def, i) => {
                        definition += `${i + 1}. ${def.definition}\n`;
                        if (def.example) {
                            definition += `   _Example: ${def.example}_\n`;
                        }
                    });
                    definition += '\n';
                }
            });
            
            return definition;
        } catch (error) {
            return `❌ Could not find definition for "${word}". Please check the spelling.`;
        }
    }

    static async measurePing() {
        const start = Date.now();
        try {
            await axios.get('https://www.google.com', { timeout: 5000 });
            return Date.now() - start;
        } catch (error) {
            return -1;
        }
    }

    static async getSystemStatus() {
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();
        
        return {
            memory: {
                used: this.formatBytes(memUsage.heapUsed),
                total: this.formatBytes(memUsage.heapTotal)
            },
            uptime: this.formatDuration(uptime),
            nodeVersion: process.version,
            platform: process.platform
        };
    }

    static async speedTest() {
        const testUrl = 'https://httpbin.org/bytes/1048576'; // 1MB test file
        const start = Date.now();
        
        try {
            const response = await axios.get(testUrl, {
                timeout: 10000,
                responseType: 'arraybuffer'
            });
            
            const duration = (Date.now() - start) / 1000;
            const sizeBytes = response.data.byteLength;
            const speedMbps = ((sizeBytes * 8) / (duration * 1000000)).toFixed(2);
            
            return {
                size: this.formatBytes(sizeBytes),
                duration: duration.toFixed(2),
                speed: speedMbps
            };
        } catch (error) {
            return null;
        }
    }

    static sanitizeFilename(filename) {
        return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
    }

    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    static extractMentions(text) {
        const mentionRegex = /@(\d+)/g;
        const mentions = [];
        let match;
        
        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        
        return mentions;
    }

    static isGroupChat(chat) {
        return chat.isGroup;
    }

    static formatProgressBar(percentage, width = 20) {
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    static async deleteFileAfterDelay(filePath, delayMs = 3600000) { // 1 hour default
        setTimeout(async () => {
            try {
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath);
                    console.log(`🗑️ Auto-deleted: ${path.basename(filePath)}`);
                }
            } catch (error) {
                console.error(`Error deleting file ${filePath}:`, error);
            }
        }, delayMs);
    }

    static getFileExtension(url, type = 'video') {
        if (type === 'audio') {
            return '.mp3';
        } else {
            return '.mp4';
        }
    }

    static async getFileSizeInMB(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.size / (1024 * 1024);
        } catch (error) {
            return 0;
        }
    }
}

module.exports = Utils;
