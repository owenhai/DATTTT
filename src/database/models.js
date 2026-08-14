/**
 * Database Table Definitions (DDL) for PostgreSQL, MySQL, and SQLite
 */

const POSTGRES_SCHEMA = [
    `CREATE TABLE IF NOT EXISTS companies (
        company_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        industry VARCHAR(150),
        company_size VARCHAR(50),
        headquarters VARCHAR(150)
    );`,

    `CREATE TABLE IF NOT EXISTS locations (
        location_id SERIAL PRIMARY KEY,
        city VARCHAR(100) NOT NULL UNIQUE,
        country VARCHAR(100) DEFAULT 'Vietnam'
    );`,

    `CREATE TABLE IF NOT EXISTS skills (
        skill_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL DEFAULT 'Other'
    );`,

    `CREATE TABLE IF NOT EXISTS jobs (
        job_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        normalized_title VARCHAR(150) NOT NULL,
        company_id INT REFERENCES companies(company_id) ON DELETE SET NULL,
        location_id INT REFERENCES locations(location_id) ON DELETE SET NULL,
        salary_min DOUBLE PRECISION,
        salary_max DOUBLE PRECISION,
        salary_currency VARCHAR(10) DEFAULT 'USD',
        raw_salary VARCHAR(100),
        experience_level VARCHAR(50) NOT NULL DEFAULT 'Not Specified',
        job_type VARCHAR(50) DEFAULT 'Full-time',
        posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source_url VARCHAR(500),
        source_platform VARCHAR(100) DEFAULT 'IT Job Portal',
        description TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS job_skills (
        job_id INT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
        skill_id INT NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
        PRIMARY KEY (job_id, skill_id)
    );`
];

const MYSQL_SCHEMA = [
    `CREATE TABLE IF NOT EXISTS companies (
        company_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        industry VARCHAR(150) NULL,
        company_size VARCHAR(50) NULL,
        headquarters VARCHAR(150) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS locations (
        location_id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(100) NOT NULL UNIQUE,
        country VARCHAR(100) DEFAULT 'Vietnam'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS skills (
        skill_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL DEFAULT 'Other'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS jobs (
        job_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        normalized_title VARCHAR(150) NOT NULL,
        company_id INT NULL,
        location_id INT NULL,
        salary_min FLOAT NULL,
        salary_max FLOAT NULL,
        salary_currency VARCHAR(10) DEFAULT 'USD',
        raw_salary VARCHAR(100) NULL,
        experience_level VARCHAR(50) NOT NULL DEFAULT 'Not Specified',
        job_type VARCHAR(50) DEFAULT 'Full-time',
        posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        source_url VARCHAR(500) NULL,
        source_platform VARCHAR(100) DEFAULT 'IT Job Portal',
        description TEXT NULL,
        FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE SET NULL,
        FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS job_skills (
        job_id INT NOT NULL,
        skill_id INT NOT NULL,
        PRIMARY KEY (job_id, skill_id),
        FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
];

const SQLITE_SCHEMA = [
    `CREATE TABLE IF NOT EXISTS companies (
        company_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        industry TEXT,
        company_size TEXT,
        headquarters TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS locations (
        location_id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL UNIQUE,
        country TEXT DEFAULT 'Vietnam'
    );`,

    `CREATE TABLE IF NOT EXISTS skills (
        skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL DEFAULT 'Other'
    );`,

    `CREATE TABLE IF NOT EXISTS jobs (
        job_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        normalized_title TEXT NOT NULL,
        company_id INTEGER,
        location_id INTEGER,
        salary_min REAL,
        salary_max REAL,
        salary_currency TEXT DEFAULT 'USD',
        raw_salary TEXT,
        experience_level TEXT NOT NULL DEFAULT 'Not Specified',
        job_type TEXT DEFAULT 'Full-time',
        posted_date TEXT DEFAULT CURRENT_TIMESTAMP,
        source_url TEXT,
        source_platform TEXT DEFAULT 'IT Job Portal',
        description TEXT,
        FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE SET NULL,
        FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL
    );`,

    `CREATE TABLE IF NOT EXISTS job_skills (
        job_id INTEGER NOT NULL,
        skill_id INTEGER NOT NULL,
        PRIMARY KEY (job_id, skill_id),
        FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
    );`
];

module.exports = {
    POSTGRES_SCHEMA,
    MYSQL_SCHEMA,
    SQLITE_SCHEMA
};
