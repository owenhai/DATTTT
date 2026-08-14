const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./src/routes/apiRoutes');
const DatabaseManager = require('./src/database/db_manager');
const PipelineService = require('./src/services/pipeline_service');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Đăng ký các Route API
app.use('/api', apiRoutes);

const dbManager = new DatabaseManager();
const pipelineService = new PipelineService();

// Khởi tạo CSDL khi khởi động Server
async function initServer() {
    await dbManager.init();
    await dbManager.initDb();

    // Nếu CSDL rỗng thì tự động chạy ETL Pipeline ban đầu
    const { jobs } = await dbManager.loadJobsData();
    if (jobs.length === 0) {
        console.log('[Server] CSDL rỗng, đang khởi chạy ETL Pipeline ban đầu...');
        await pipelineService.runEtlPipeline();
    }
}

initServer().then(() => {
    app.listen(config.PORT, () => {
        console.log(`\n==================================================`);
        console.log(` 🚀 TECH JOB ANALYTICS DASHBOARD IS LIVE!`);
        console.log(` 🌐 Địa chỉ Web: http://localhost:${config.PORT}`);
        console.log(`==================================================\n`);
    });
}).catch(err => {
    console.error('Lỗi khi khởi động Server:', err);
});
