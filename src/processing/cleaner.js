const cheerio = require('cheerio');
const crypto = require('crypto');

// =====================================================================
// CLASS 1: Text Cleaner Engine
// =====================================================================
class TextCleaner {
    static clean(text) {
        if (!text) return "";
        let cleaned = text;
        // 1. Loại bỏ các thẻ HTML nếu có
        if (cleaned.includes('<') && cleaned.includes('>')) {
            const $ = cheerio.load(cleaned);
            cleaned = $.text();
        }
        // 2. Chuẩn hóa khoảng trắng và dòng mới
        cleaned = cleaned.replace(/\s+/g, ' ');
        return cleaned.trim();
    }
}

// =====================================================================
// CLASS 2: Duplicate Filter Engine
// =====================================================================
class DuplicateFilter {
    static filterDuplicates(jobsList) {
        const seenHashes = new Set();
        const uniqueJobs = [];

        for (const job of jobsList) {
            const title = (job.title || '').trim().toLowerCase();
            const company = (job.company_name || '').trim().toLowerCase();
            const city = (job.city || '').trim().toLowerCase();

            const rawIdentifier = `${title}|${company}|${city}`;
            const jobHash = crypto.createHash('md5').update(rawIdentifier, 'utf8').digest('hex');

            if (!seenHashes.has(jobHash)) {
                seenHashes.add(jobHash);
                uniqueJobs.push(job);
            }
        }

        console.log(`[DataCleaner] Lọc trùng hoàn tất: ${jobsList.length} -> ${uniqueJobs.length} tin (Loại bỏ ${jobsList.length - uniqueJobs.length} tin trùng).`);
        return uniqueJobs;
    }
}

// =====================================================================
// CLASS 3: Data Cleaner Facade
// =====================================================================
class DataCleaner {
    constructor() {
        this.textCleaner = TextCleaner;
        this.duplicateFilter = DuplicateFilter;
    }

    cleanText(text) {
        return this.textCleaner.clean(text);
    }

    deduplicateJobs(jobsList) {
        return this.duplicateFilter.filterDuplicates(jobsList);
    }
}

module.exports = {
    TextCleaner,
    DuplicateFilter,
    DataCleaner
};
