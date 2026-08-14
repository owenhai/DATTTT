const { Pool, Client } = require('pg');
const mysql = require('mysql2/promise');
const initSqlJs = require('sql.js');
const fs = require('fs');
const config = require('../../config');

/**
 * Quản lý kết nối tới CSDL PostgreSQL, MySQL hoặc SQLite Fallback
 */
class DatabaseConnector {
    constructor() {
        this.pgPool = null;
        this.mysqlPool = null;
        this.sqliteDb = null;
        this.SQL = null;
        this.dbEngine = 'sqlite'; // 'postgres' | 'mysql' | 'sqlite'
        this.isFallback = false;
    }

    /**
     * Thiết lập kết nối CSDL dựa trên file cấu hình config.js (.env)
     */
    async establishConnection() {
        const dbType = config.DB_TYPE.toLowerCase();

        if (dbType.includes('postgres')) {
            try {
                // 1. Kết nối DB mặc định 'postgres' để đảm bảo database tech_jobs_db tồn tại
                const adminClient = new Client({
                    host: config.DB_HOST,
                    port: config.DB_PORT,
                    user: config.DB_USER,
                    password: config.DB_PASSWORD,
                    database: 'postgres'
                });
                await adminClient.connect();
                const checkDb = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1;`, [config.DB_NAME]);
                if (checkDb.rowCount === 0) {
                    await adminClient.query(`CREATE DATABASE "${config.DB_NAME}";`);
                }
                await adminClient.end();

                // 2. Tạo Pool kết nối tới PostgreSQL DB
                this.pgPool = new Pool({
                    host: config.DB_HOST,
                    port: config.DB_PORT,
                    user: config.DB_USER,
                    password: config.DB_PASSWORD,
                    database: config.DB_NAME,
                    max: 10,
                    idleTimeoutMillis: 30000
                });

                // Test connection
                const client = await this.pgPool.connect();
                await client.query('SELECT 1;');
                client.release();

                console.log(`[DB_Connector] Kết nối thành công CSDL PostgreSQL: ${config.DB_NAME}`);
                this.dbEngine = 'postgres';
                this.isFallback = false;
            } catch (err) {
                console.warn(`[DB_Connector] Không thể kết nối Server PostgreSQL (${err.message}).`);
                if (config.ENABLE_SQLITE_FALLBACK) {
                    console.log('[DB_Connector] Chuyển sang chế độ SQLite Fallback...');
                    await this.initSqlite();
                } else {
                    throw err;
                }
            }
        } else if (dbType === 'mysql') {
            try {
                const serverConnection = await mysql.createConnection({
                    host: config.DB_HOST,
                    port: config.DB_PORT,
                    user: config.DB_USER,
                    password: config.DB_PASSWORD,
                });
                await serverConnection.query(
                    `CREATE DATABASE IF NOT EXISTS \`${config.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
                );
                await serverConnection.end();

                this.mysqlPool = mysql.createPool({
                    host: config.DB_HOST,
                    port: config.DB_PORT,
                    user: config.DB_USER,
                    password: config.DB_PASSWORD,
                    database: config.DB_NAME,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                    charset: 'utf8mb4'
                });

                const conn = await this.mysqlPool.getConnection();
                await conn.ping();
                conn.release();

                console.log(`[DB_Connector] Kết nối thành công CSDL MySQL: ${config.DB_NAME}`);
                this.dbEngine = 'mysql';
                this.isFallback = false;
            } catch (err) {
                console.warn(`[DB_Connector] Không thể kết nối Server MySQL (${err.message}).`);
                if (config.ENABLE_SQLITE_FALLBACK) {
                    console.log('[DB_Connector] Chuyển sang chế độ SQLite Fallback...');
                    await this.initSqlite();
                } else {
                    throw err;
                }
            }
        } else {
            console.log('[DB_Connector] Cấu hình DB_TYPE = sqlite. Sử dụng SQLite DB...');
            await this.initSqlite();
        }
    }

    /**
     * Khởi tạo SQLite DB in-memory và ghi ra file persistent
     */
    async initSqlite() {
        this.isFallback = true;
        this.dbEngine = 'sqlite';
        if (!this.SQL) {
            this.SQL = await initSqlJs();
        }
        
        if (fs.existsSync(config.SQLITE_DB_PATH)) {
            const filebuffer = fs.readFileSync(config.SQLITE_DB_PATH);
            this.sqliteDb = new this.SQL.Database(filebuffer);
        } else {
            this.sqliteDb = new this.SQL.Database();
        }

        this.sqliteDb.run('PRAGMA foreign_keys = ON;');
        console.log(`[DB_Connector] Đã kết nối SQLite tại: ${config.SQLITE_DB_PATH}`);
    }

    /**
     * Lưu trạng thái SQLite DB xuống file disk
     */
    saveSqliteFile() {
        if (this.sqliteDb) {
            const data = this.sqliteDb.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(config.SQLITE_DB_PATH, buffer);
        }
    }
}

module.exports = DatabaseConnector;
