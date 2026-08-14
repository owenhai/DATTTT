const DatabaseConnector = require('./db_connection');
const DatabaseSchemaInitializer = require('./db_schema');
const JobRepository = require('./job_repository');

/**
 * DatabaseManager Facade gộp các lớp DatabaseConnector, DatabaseSchemaInitializer và JobRepository.
 * Đảm bảo tính tương thích ngược 100% với mã nguồn hiện tại.
 */
class DatabaseManager {
    constructor() {
        this.connector = new DatabaseConnector();
        this.initializer = new DatabaseSchemaInitializer(this.connector);
        this.repository = new JobRepository(this.connector);
    }

    /**
     * Khởi tạo kết nối tới Database (PostgreSQL, MySQL hoặc SQLite Fallback)
     */
    async init() {
        await this.connector.establishConnection();
        this.isFallback = this.connector.isFallback;
        this.dbEngine = this.connector.dbEngine;
    }

    /**
     * Khởi tạo cấu trúc các bảng CSDL
     */
    async initDb() {
        await this.initializer.createTables();
    }

    /**
     * Xóa dữ liệu trong các bảng CSDL
     */
    async clearDatabase() {
        await this.initializer.clearTables();
    }

    /**
     * Lưu bài tuyển dụng đã chuẩn hóa vào CSDL
     * @param {Array<Object>} jobsList 
     */
    async saveProcessedJobs(jobsList) {
        await this.repository.saveJobs(jobsList);
    }

    /**
     * Tải dữ liệu tuyển dụng & kỹ năng từ CSDL
     */
    async loadJobsData() {
        return await this.repository.loadJobsData();
    }
}

module.exports = DatabaseManager;
