const PipelineService = require('./src/services/pipeline_service');

class TechJobDataPipeline {
    constructor() {
        this.pipelineService = new PipelineService();
    }

    async run(count = 150) {
        return await this.pipelineService.runEtlPipeline(count);
    }
}

async function runFullPipeline() {
    const pipeline = new TechJobDataPipeline();
    const requestedCount = Number(process.argv[2] || process.env.JOB_COUNT || 150);
    if (!Number.isInteger(requestedCount) || requestedCount < 1) {
        throw new Error('Số lượng tin phải là số nguyên dương. Ví dụ: npm run pipeline -- 100');
    }
    await pipeline.run(requestedCount);
}

if (require.main === module) {
    runFullPipeline().catch(err => {
        console.error("Lỗi khi chạy ETL Pipeline:", err);
    });
}

module.exports = TechJobDataPipeline;
