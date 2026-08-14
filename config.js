const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const BASE_DIR = __dirname;
dotenv.config({ path: path.join(BASE_DIR, '.env') });

const DB_TYPE = (process.env.DB_TYPE || 'postgresql').toLowerCase();
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || (DB_TYPE.includes('postgres') ? '5432' : '3306'), 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_NAME = process.env.DB_NAME || 'tech_jobs_db';

const ENABLE_SQLITE_FALLBACK = (process.env.ENABLE_SQLITE_FALLBACK || 'true').toLowerCase() === 'true';
const SQLITE_DB_PATH = path.resolve(BASE_DIR, process.env.SQLITE_DB_PATH || 'tech_jobs_fallback.db');
const PORT = parseInt(process.env.PORT || '3000', 10);

module.exports = {
    BASE_DIR,
    DB_TYPE,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    ENABLE_SQLITE_FALLBACK,
    SQLITE_DB_PATH,
    PORT
};
