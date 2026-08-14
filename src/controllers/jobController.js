const DatabaseManager = require('../database/db_manager');
const { JobAnalyzer } = require('../analytics/analyzer');
const PipelineService = require('../services/pipeline_service');
const ExcelService = require('../services/excel_service');

class JobController {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.pipelineService = new PipelineService();
        this.excelService = new ExcelService();
    }

    /**
     * Khởi tạo kết nối DB cho controller nếu chưa kết nối
     */
    async init() {
        await this.dbManager.init();
        await this.dbManager.initDb();
    }

    /**
     * API 1: Lấy toàn bộ dữ liệu & thống kê KPI phân tích
     */
    getAnalyticsData = async (req, res) => {
        try {
            await this.init();
            const { jobs, skills } = await this.dbManager.loadJobsData();
            const analyzer = new JobAnalyzer(jobs, skills);

            res.json({
                success: true,
                isFallback: this.dbManager.isFallback,
                jobs,
                skills,
                kpis: analyzer.getKpiSummary(),
                topSkills: analyzer.getTopSkills(15),
                salaryRole: analyzer.getSalaryByRole(),
                salaryExp: analyzer.getSalaryByExperience(),
                locations: analyzer.getLocationDistribution(),
                cooccurrence: analyzer.getSkillCooccurrence(8)
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    };

    /**
     * API 2: Chạy lại toàn bộ ETL Pipeline
     */
    runPipeline = async (req, res) => {
        try {
            console.log('[JobController] Đã nhận yêu cầu chạy lại ETL Pipeline...');
            await this.pipelineService.runEtlPipeline();
            res.json({ success: true, message: 'Đã hoàn thành chạy quy trình ETL Pipeline!' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    };

    /**
     * API 3: Cào dữ liệu bài đăng từ URL thực tế
     */
    scrapeUrl = async (req, res) => {
        try {
            const { urls, url } = req.body;
            const targetUrls = urls || (url ? [url] : []);

            if (targetUrls.length === 0) {
                return res.status(400).json({ success: false, error: 'Vui lòng cung cấp ít nhất 1 link URL.' });
            }

            const processedJobs = await this.pipelineService.processScrapedUrls(targetUrls);

            res.json({
                success: true,
                count: processedJobs.length,
                message: `Đã cào và lưu thành công ${processedJobs.length} bài đăng vào CSDL.`
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    };

    /**
     * API 4: Xuất toàn bộ dữ liệu & thống kê ra file Excel (.xlsx)
     */
    exportExcel = async (req, res) => {
        try {
            await this.init();
            const { jobs, skills } = await this.dbManager.loadJobsData();
            const analyzer = new JobAnalyzer(jobs, skills);
            const kpis = analyzer.getKpiSummary();
            const topSkills = analyzer.getTopSkills(15);

            console.log('[JobController] Đang khởi tạo và tạo file báo cáo Excel (.xlsx)...');
            const excelBuffer = await this.excelService.generateJobsReport(jobs, skills, kpis, topSkills);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="Tech_Job_Analytics_Report.xlsx"');
            res.send(excelBuffer);
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    };
}

module.exports = new JobController();
