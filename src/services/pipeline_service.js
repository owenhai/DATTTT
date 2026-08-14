const { JobDataCollector } = require('../data_collection/scraper');
const { DataCleaner } = require('../processing/cleaner');
const { DataNormalizer } = require('../processing/normalizer');
const DatabaseManager = require('../database/db_manager');
const { JobAnalyzer } = require('../analytics/analyzer');

/**
 * Service quản lý quy trình ETL (Extract - Transform - Load) và Cào dữ liệu theo URL
 */
class PipelineService {
    constructor() {
        this.collector = new JobDataCollector();
        this.cleaner = new DataCleaner();
        this.normalizer = new DataNormalizer();
        this.dbManager = new DatabaseManager();
    }

    /**
     * Chạy quy trình ETL tự động
     * @param {number} count Số lượng bài viết cần cào giả lập (mặc định 150)
     */
    async runEtlPipeline(count = 150) {
        console.log("=" .repeat(65));
        console.log(" BẮT ĐẦU QUY TRÌNH ETL PHÂN TÍCH TUYỂN DỤNG IT (PIPELINE SERVICE)");
        console.log("=" .repeat(65));

        // Step 1: Initialize Database
        await this.dbManager.init();
        await this.dbManager.initDb();
        await this.dbManager.clearDatabase();

        // Step 2: Data Collection
        console.log("\n--- BƯỚC 1: THU THẬP DỮ LIỆU ---");
        const rawJobs = await this.collector.collectJobs(count);

        // Step 3: Cleaning & Deduplication
        console.log("\n--- BƯỚC 2: LÀM SẠCH VÀ LỌC TRÙNG ---");
        const cleanedJobs = this.cleaner.deduplicateJobs(rawJobs);

        // Step 4: Normalization
        console.log("\n--- BƯỚC 3: CHUẨN HÓA KỸ NĂNG, LƯƠNG, VỊ TRÍ, KINH NGHIỆM ---");
        const processedJobs = this.processRawJobsList(cleanedJobs);

        // Step 5: Save to Database
        console.log("\n--- BƯỚC 4: LƯU VÀO CSDL MYSQL / SQLITE ---");
        await this.dbManager.saveProcessedJobs(processedJobs);

        // Step 6: Analytical Verification
        console.log("\n--- BƯỚC 5: PHÂN TÍCH TỔNG QUAN ---");
        const { jobs, skills } = await this.dbManager.loadJobsData();
        const analyzer = new JobAnalyzer(jobs, skills);
        const kpis = analyzer.getKpiSummary();

        console.log("=" .repeat(65));
        console.log(` TỔNG SỐ BÀI ĐĂNG TRONG CSDL: ${kpis.total_jobs}`);
        console.log(` TỔNG SỐ CÔNG TY TUYỂN DỤNG : ${kpis.total_companies}`);
        console.log(` MỨC LƯƠNG TRUNG BÌNH (USD) : $${kpis.avg_salary_usd.toLocaleString()}`);
        console.log(` KỸ NĂNG HOT NHẤT THỊ TRƯỜNG: ${kpis.top_skill}`);
        console.log("=" .repeat(65));
        console.log("QUY TRÌNH ETL HOÀN THÀNH THÀNH CÔNG!");
        
        return kpis;
    }

    /**
     * Cào và xử lý các bài tuyển dụng từ danh sách URL truyền vào
     * @param {Array<string>} urls Danh sách URL bài đăng tuyển dụng
     */
    async processScrapedUrls(urls) {
        if (!urls || urls.length === 0) {
            throw new Error('Vui lòng cung cấp ít nhất 1 link URL.');
        }

        console.log(`[PipelineService] Đang cào dữ liệu từ ${urls.length} link URL...`);
        const rawJobs = await this.collector.collectJobs(urls.length, urls);
        
        if (!rawJobs || rawJobs.length === 0) {
            throw new Error('Không thể cào dữ liệu từ URL đã nhập.');
        }

        const processed = this.processRawJobsList(rawJobs);

        await this.dbManager.init();
        await this.dbManager.initDb();
        await this.dbManager.saveProcessedJobs(processed);

        return processed;
    }

    /**
     * Chuẩn hóa danh sách bài viết thô
     * @param {Array<Object>} rawJobsList 
     * @returns {Array<Object>}
     */
    processRawJobsList(rawJobsList) {
        const processedJobs = [];
        for (const item of rawJobsList) {
            const cleanDesc = this.cleaner.cleanText(item.description || '');
            const salaryInfo = this.normalizer.normalizeSalary(item.raw_salary || '');
            const extractedSkills = this.normalizer.extractSkills(cleanDesc);
            const normTitle = this.normalizer.normalizeTitle(item.title || '');
            const normExp = this.normalizer.normalizeExperience(item.experience_level_raw || '');

            processedJobs.push({
                title: item.title,
                normalized_title: normTitle,
                company_name: item.company_name,
                city: item.city,
                salary_min: salaryInfo.salary_min,
                salary_max: salaryInfo.salary_max,
                salary_currency: salaryInfo.currency,
                raw_salary: item.raw_salary,
                experience_level: normExp || "Mid-Level (2-4 yrs)",
                job_type: "Full-time",
                source_url: item.source_url,
                source_platform: item.source_platform || "URL Crawler Tự động",
                description: cleanDesc,
                skills: extractedSkills
            });
        }
        return processedJobs;
    }
}

module.exports = PipelineService;
