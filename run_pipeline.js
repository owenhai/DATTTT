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
    await pipeline.run();
}

if (require.main === module) {
    runFullPipeline().catch(err => {
        console.error("Lỗi khi chạy ETL Pipeline:", err);
    });
}

module.exports = TechJobDataPipeline;
