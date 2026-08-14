const { POSTGRES_SCHEMA, MYSQL_SCHEMA, SQLITE_SCHEMA } = require('./models');

/**
 * Quản lý khởi tạo bảng (Schema DDL) và xóa làm sạch bảng dữ liệu
 */
class DatabaseSchemaInitializer {
    /**
     * @param {import('./db_connection')} connector 
     */
    constructor(connector) {
        this.connector = connector;
    }

    /**
     * Khởi tạo các bảng CSDL (companies, locations, skills, jobs, job_skills)
     */
    async createTables() {
        if (this.connector.dbEngine === 'postgres' && this.connector.pgPool) {
            const client = await this.connector.pgPool.connect();
            try {
                for (const query of POSTGRES_SCHEMA) {
                    await client.query(query);
                }
                console.log('[DB_Schema] Đã khởi tạo xong các bảng PostgreSQL CSDL (3NF).');
            } finally {
                client.release();
            }
        } else if (this.connector.dbEngine === 'mysql' && this.connector.mysqlPool) {
            const conn = await this.connector.mysqlPool.getConnection();
            try {
                for (const query of MYSQL_SCHEMA) {
                    await conn.query(query);
                }
                console.log('[DB_Schema] Đã khởi tạo xong các bảng MySQL CSDL (3NF).');
            } finally {
                conn.release();
            }
        } else if (this.connector.sqliteDb) {
            for (const query of SQLITE_SCHEMA) {
                this.connector.sqliteDb.run(query);
            }
            this.connector.saveSqliteFile();
            console.log('[DB_Schema] Đã khởi tạo xong các bảng SQLite CSDL (3NF).');
        }
    }

    /**
     * Xóa sạch dữ liệu trong các bảng CSDL
     */
    async clearTables() {
        if (this.connector.dbEngine === 'postgres' && this.connector.pgPool) {
            const client = await this.connector.pgPool.connect();
            try {
                await client.query('BEGIN;');
                await client.query('DELETE FROM job_skills;');
                await client.query('DELETE FROM jobs;');
                await client.query('DELETE FROM companies;');
                await client.query('DELETE FROM skills;');
                await client.query('DELETE FROM locations;');
                await client.query('COMMIT;');
                console.log('[DB_Schema] Đã xóa sạch dữ liệu cũ trong các bảng PostgreSQL CSDL.');
            } catch (e) {
                await client.query('ROLLBACK;');
                console.error(`[DB_Schema] Lỗi khi xóa bảng PostgreSQL: ${e.message}`);
            } finally {
                client.release();
            }
        } else if (this.connector.dbEngine === 'mysql' && this.connector.mysqlPool) {
            const conn = await this.connector.mysqlPool.getConnection();
            try {
                await conn.beginTransaction();
                await conn.query('DELETE FROM job_skills;');
                await conn.query('DELETE FROM jobs;');
                await conn.query('DELETE FROM companies;');
                await conn.query('DELETE FROM skills;');
                await conn.query('DELETE FROM locations;');
                await conn.commit();
                console.log('[DB_Schema] Đã xóa sạch dữ liệu cũ trong các bảng MySQL CSDL.');
            } catch (e) {
                await conn.rollback();
                console.error(`[DB_Schema] Lỗi khi xóa bảng MySQL: ${e.message}`);
            } finally {
                conn.release();
            }
        } else if (this.connector.sqliteDb) {
            this.connector.sqliteDb.run('DELETE FROM job_skills;');
            this.connector.sqliteDb.run('DELETE FROM jobs;');
            this.connector.sqliteDb.run('DELETE FROM companies;');
            this.connector.sqliteDb.run('DELETE FROM skills;');
            this.connector.sqliteDb.run('DELETE FROM locations;');
            this.connector.saveSqliteFile();
            console.log('[DB_Schema] Đã xóa sạch dữ liệu cũ trong các bảng SQLite CSDL.');
        }
    }
}

module.exports = DatabaseSchemaInitializer;
