const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Route 1: Lấy toàn bộ dữ liệu & thống kê KPI
router.get('/data', jobController.getAnalyticsData);

// Route 2: Chạy lại quy trình ETL Pipeline
router.post('/pipeline/run', jobController.runPipeline);

// Route 3: Cào dữ liệu bài đăng từ URL
router.post('/scrape-url', jobController.scrapeUrl);

// Route 4: Xuất báo cáo dữ liệu ra file Excel (.xlsx)
router.get('/export/excel', jobController.exportExcel);

module.exports = router;
