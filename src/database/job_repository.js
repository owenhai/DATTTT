/**
 * Thực hiện các thao tác CRUD và truy vấn dữ liệu tuyển dụng
 */
class JobRepository {
    /**
     * @param {import('./db_connection')} connector 
     */
    constructor(connector) {
        this.connector = connector;
    }

    /**
     * Lưu danh sách bài tuyển dụng đã qua xử lý (Processed Jobs) vào CSDL
     * @param {Array<Object>} processedJobsList 
     */
    async saveJobs(processedJobsList) {
        if (this.connector.dbEngine === 'postgres' && this.connector.pgPool) {
            return this.saveJobsPostgreSQL(processedJobsList);
        } else if (this.connector.dbEngine === 'mysql' && this.connector.mysqlPool) {
            return this.saveJobsMySQL(processedJobsList);
        } else if (this.connector.sqliteDb) {
            return this.saveJobsSQLite(processedJobsList);
        }
    }

    async saveJobsPostgreSQL(processedJobsList) {
        const client = await this.connector.pgPool.connect();
        try {
            await client.query('BEGIN;');

            const compRes = await client.query('SELECT company_id, name FROM companies;');
            const companyMap = new Map(compRes.rows.map(c => [c.name, c.company_id]));

            const locRes = await client.query('SELECT location_id, city FROM locations;');
            const locationMap = new Map(locRes.rows.map(l => [l.city, l.location_id]));

            const skillRes = await client.query('SELECT skill_id, name FROM skills;');
            const skillMap = new Map(skillRes.rows.map(s => [s.name, s.skill_id]));

            for (const item of processedJobsList) {
                // 1. Company
                const compName = item.company_name || 'Unknown Company';
                let companyId = companyMap.get(compName);
                if (!companyId) {
                    const insComp = await client.query(
                        'INSERT INTO companies (name, industry) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET industry = EXCLUDED.industry RETURNING company_id;',
                        [compName, item.industry || 'IT/Tech']
                    );
                    companyId = insComp.rows[0].company_id;
                    companyMap.set(compName, companyId);
                }

                // 2. Location
                const cityName = item.city || 'Hồ Chí Minh';
                let locationId = locationMap.get(cityName);
                if (!locationId) {
                    const insLoc = await client.query(
                        'INSERT INTO locations (city, country) VALUES ($1, $2) ON CONFLICT (city) DO UPDATE SET country = EXCLUDED.country RETURNING location_id;',
                        [cityName, 'Vietnam']
                    );
                    locationId = insLoc.rows[0].location_id;
                    locationMap.set(cityName, locationId);
                }

                // 3. Skills
                const extractedSkills = item.skills || [];
                const skillIds = [];
                for (const sDict of extractedSkills) {
                    const sName = sDict.name;
                    const sCat = sDict.category || 'Other';
                    let skillId = skillMap.get(sName);
                    if (!skillId) {
                        const insSk = await client.query(
                            'INSERT INTO skills (name, category) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category RETURNING skill_id;',
                            [sName, sCat]
                        );
                        skillId = insSk.rows[0].skill_id;
                        skillMap.set(sName, skillId);
                    }
                    skillIds.push(skillId);
                }

                // 4. Job
                const insJob = await client.query(
                    `INSERT INTO jobs (
                        title, normalized_title, company_id, location_id,
                        salary_min, salary_max, salary_currency, raw_salary,
                        experience_level, job_type, source_url, source_platform, description
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING job_id;`,
                    [
                        item.title,
                        item.normalized_title || item.title,
                        companyId,
                        locationId,
                        item.salary_min ?? null,
                        item.salary_max ?? null,
                        item.salary_currency || 'USD',
                        item.raw_salary || '',
                        item.experience_level || 'Not Specified',
                        item.job_type || 'Full-time',
                        item.source_url || '',
                        item.source_platform || 'ITViec/TopCV',
                        item.description || ''
                    ]
                );
                const jobId = insJob.rows[0].job_id;

                // 5. Job Skills
                for (const sId of skillIds) {
                    await client.query(
                        'INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;',
                        [jobId, sId]
                    );
                }
            }

            await client.query('COMMIT;');
            console.log(`[Job_Repository] Đã lưu thành công ${processedJobsList.length} bài tuyển dụng vào PostgreSQL.`);
        } catch (err) {
            await client.query('ROLLBACK;');
            console.error(`[Job_Repository] Lỗi khi lưu PostgreSQL: ${err.message}`);
            throw err;
        } finally {
            client.release();
        }
    }

    async saveJobsMySQL(processedJobsList) {
        const conn = await this.connector.mysqlPool.getConnection();
        try {
            await conn.beginTransaction();

            const [companyRows] = await conn.query('SELECT company_id, name FROM companies;');
            const companyMap = new Map(companyRows.map(c => [c.name, c.company_id]));

            const [locationRows] = await conn.query('SELECT location_id, city FROM locations;');
            const locationMap = new Map(locationRows.map(l => [l.city, l.location_id]));

            const [skillRows] = await conn.query('SELECT skill_id, name FROM skills;');
            const skillMap = new Map(skillRows.map(s => [s.name, s.skill_id]));

            for (const item of processedJobsList) {
                const compName = item.company_name || 'Unknown Company';
                let companyId = companyMap.get(compName);
                if (!companyId) {
                    const [res] = await conn.query(
                        'INSERT INTO companies (name, industry) VALUES (?, ?);',
                        [compName, item.industry || 'IT/Tech']
                    );
                    companyId = res.insertId;
                    companyMap.set(compName, companyId);
                }

                const cityName = item.city || 'Hồ Chí Minh';
                let locationId = locationMap.get(cityName);
                if (!locationId) {
                    const [res] = await conn.query(
                        'INSERT INTO locations (city, country) VALUES (?, ?);',
                        [cityName, 'Vietnam']
                    );
                    locationId = res.insertId;
                    locationMap.set(cityName, locationId);
                }

                const extractedSkills = item.skills || [];
                const skillIds = [];
                for (const sDict of extractedSkills) {
                    const sName = sDict.name;
                    const sCat = sDict.category || 'Other';
                    let skillId = skillMap.get(sName);
                    if (!skillId) {
                        const [res] = await conn.query(
                            'INSERT INTO skills (name, category) VALUES (?, ?);',
                            [sName, sCat]
                        );
                        skillId = res.insertId;
                        skillMap.set(sName, skillId);
                    }
                    skillIds.push(skillId);
                }

                const [jobRes] = await conn.query(
                    `INSERT INTO jobs (
                        title, normalized_title, company_id, location_id,
                        salary_min, salary_max, salary_currency, raw_salary,
                        experience_level, job_type, source_url, source_platform, description
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        item.title,
                        item.normalized_title || item.title,
                        companyId,
                        locationId,
                        item.salary_min ?? null,
                        item.salary_max ?? null,
                        item.salary_currency || 'USD',
                        item.raw_salary || '',
                        item.experience_level || 'Not Specified',
                        item.job_type || 'Full-time',
                        item.source_url || '',
                        item.source_platform || 'ITViec/TopCV',
                        item.description || ''
                    ]
                );
                const jobId = jobRes.insertId;

                for (const sId of skillIds) {
                    await conn.query(
                        'INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?);',
                        [jobId, sId]
                    );
                }
            }

            await conn.commit();
            console.log(`[Job_Repository] Đã lưu thành công ${processedJobsList.length} bài tuyển dụng vào MySQL.`);
        } catch (err) {
            await conn.rollback();
            console.error(`[Job_Repository] Lỗi khi lưu MySQL: ${err.message}`);
            throw err;
        } finally {
            conn.release();
        }
    }

    saveJobsSQLite(processedJobsList) {
        const db = this.connector.sqliteDb;

        const getCompanyId = (name, industry) => {
            const stmt = db.prepare("SELECT company_id FROM companies WHERE name = ?;");
            stmt.bind([name]);
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                return row.company_id;
            }
            stmt.free();

            db.run("INSERT INTO companies (name, industry) VALUES (?, ?);", [name, industry || 'IT/Tech']);
            const res = db.exec("SELECT last_insert_rowid() as id;");
            return res[0].values[0][0];
        };

        const getLocationId = (city) => {
            const stmt = db.prepare("SELECT location_id FROM locations WHERE city = ?;");
            stmt.bind([city]);
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                return row.location_id;
            }
            stmt.free();

            db.run("INSERT INTO locations (city, country) VALUES (?, ?);", [city, 'Vietnam']);
            const res = db.exec("SELECT last_insert_rowid() as id;");
            return res[0].values[0][0];
        };

        const getSkillId = (name, category) => {
            const stmt = db.prepare("SELECT skill_id FROM skills WHERE name = ?;");
            stmt.bind([name]);
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                return row.skill_id;
            }
            stmt.free();

            db.run("INSERT INTO skills (name, category) VALUES (?, ?);", [name, category || 'Other']);
            const res = db.exec("SELECT last_insert_rowid() as id;");
            return res[0].values[0][0];
        };

        for (const item of processedJobsList) {
            const compName = item.company_name || 'Unknown Company';
            const companyId = getCompanyId(compName, item.industry);

            const cityName = item.city || 'Hồ Chí Minh';
            const locationId = getLocationId(cityName);

            const extractedSkills = item.skills || [];
            const skillIds = [];
            for (const sDict of extractedSkills) {
                const sId = getSkillId(sDict.name, sDict.category);
                skillIds.push(sId);
            }

            db.run(`
                INSERT INTO jobs (
                    title, normalized_title, company_id, location_id,
                    salary_min, salary_max, salary_currency, raw_salary,
                    experience_level, job_type, source_url, source_platform, description
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `, [
                item.title,
                item.normalized_title || item.title,
                companyId,
                locationId,
                item.salary_min ?? null,
                item.salary_max ?? null,
                item.salary_currency || 'USD',
                item.raw_salary || '',
                item.experience_level || 'Not Specified',
                item.job_type || 'Full-time',
                item.source_url || '',
                item.source_platform || 'ITViec/TopCV',
                item.description || ''
            ]);

            const res = db.exec("SELECT last_insert_rowid() as id;");
            const jobId = res[0].values[0][0];

            for (const sId of skillIds) {
                db.run("INSERT OR IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?);", [jobId, sId]);
            }
        }

        this.connector.saveSqliteFile();
        console.log(`[Job_Repository] Đã lưu thành công ${processedJobsList.length} bài tuyển dụng vào SQLite.`);
    }

    /**
     * Tải toàn bộ thông tin Jobs và Skills từ CSDL để phân tích Analytics
     * @returns {Promise<{jobs: Array, skills: Array}>}
     */
    async loadJobsData() {
        const queryJobs = `
            SELECT 
                j.job_id, j.title, j.normalized_title,
                c.name as company_name, l.city as location,
                j.salary_min, j.salary_max, j.salary_currency, j.raw_salary,
                j.experience_level, j.job_type, j.source_platform, j.source_url, j.description
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.company_id
            LEFT JOIN locations l ON j.location_id = l.location_id
        `;

        const querySkills = `
            SELECT js.job_id, s.name as skill_name, s.category as skill_category
            FROM job_skills js
            JOIN skills s ON js.skill_id = s.skill_id
        `;

        if (this.connector.dbEngine === 'postgres' && this.connector.pgPool) {
            const jobsRes = await this.connector.pgPool.query(queryJobs);
            const skillsRes = await this.connector.pgPool.query(querySkills);
            return { jobs: jobsRes.rows, skills: skillsRes.rows };
        } else if (this.connector.dbEngine === 'mysql' && this.connector.mysqlPool) {
            const [jobs] = await this.connector.mysqlPool.query(queryJobs);
            const [skills] = await this.connector.mysqlPool.query(querySkills);
            return { jobs, skills };
        } else if (this.connector.sqliteDb) {
            const db = this.connector.sqliteDb;

            const execQuery = (sql) => {
                const stmt = db.prepare(sql);
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            };

            const jobs = execQuery(queryJobs);
            const skills = execQuery(querySkills);
            return { jobs, skills };
        }
        return { jobs: [], skills: [] };
    }
}

module.exports = JobRepository;
