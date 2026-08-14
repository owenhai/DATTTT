// =====================================================================
// CLASS 1: KPI Metrics Calculator
// =====================================================================
class KpiMetricsCalculator {
    static calculateSummary(jobs, skills) {
        const totalJobs = jobs.length;

        const uniqueCompanies = new Set();
        jobs.forEach(j => {
            if (j.company_name) uniqueCompanies.add(j.company_name);
        });
        const totalCompanies = uniqueCompanies.size;

        const validSalaries = jobs.filter(j => j.salary_min !== null && j.salary_max !== null && j.salary_min !== undefined && j.salary_max !== undefined);
        let avgSalaryUsd = 0;
        if (validSalaries.length > 0) {
            const sumAvg = validSalaries.reduce((sum, j) => sum + (j.salary_min + j.salary_max) / 2.0, 0);
            avgSalaryUsd = Math.round(sumAvg / validSalaries.length);
        }

        const skillCounts = {};
        skills.forEach(s => {
            if (s.skill_name) {
                skillCounts[s.skill_name] = (skillCounts[s.skill_name] || 0) + 1;
            }
        });

        let topSkillName = "N/A";
        let maxCount = 0;
        for (const [sName, cnt] of Object.entries(skillCounts)) {
            if (cnt > maxCount) {
                maxCount = cnt;
                topSkillName = sName;
            }
        }

        return {
            total_jobs: totalJobs,
            total_companies: totalCompanies,
            avg_salary_usd: avgSalaryUsd,
            top_skill: topSkillName
        };
    }
}

// =====================================================================
// CLASS 2: Skill Analytics Engine
// =====================================================================
class SkillAnalyticsEngine {
    static getTopSkills(jobs, skills, topN = 15, roleFilter = null) {
        if (!skills || skills.length === 0) return [];

        const jobMap = new Map();
        jobs.forEach(j => jobMap.set(j.job_id, j));

        const counts = {};
        skills.forEach(s => {
            const job = jobMap.get(s.job_id);
            if (!job) return;

            if (roleFilter && roleFilter !== "Tất cả" && job.normalized_title !== roleFilter) {
                return;
            }

            const key = s.skill_name;
            if (!counts[key]) {
                counts[key] = { skill_name: s.skill_name, skill_category: s.skill_category, count: 0 };
            }
            counts[key].count += 1;
        });

        const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
        return sorted.slice(0, topN);
    }

    static getCooccurrenceMatrix(skills, topN = 8) {
        if (!skills || skills.length === 0) return { labels: [], matrix: [] };

        // Count overall frequencies
        const counts = {};
        skills.forEach(s => {
            counts[s.skill_name] = (counts[s.skill_name] || 0) + 1;
        });

        const topSkillNames = Object.keys(counts)
            .sort((a, b) => counts[b] - counts[a])
            .slice(0, topN);

        if (topSkillNames.length === 0) return { labels: [], matrix: [] };

        // Group skills by job_id
        const jobSkillsMap = new Map();
        skills.forEach(s => {
            if (topSkillNames.includes(s.skill_name)) {
                if (!jobSkillsMap.has(s.job_id)) {
                    jobSkillsMap.set(s.job_id, new Set());
                }
                jobSkillsMap.get(s.job_id).add(s.skill_name);
            }
        });

        // Build N x N co-occurrence matrix
        const n = topSkillNames.length;
        const matrix = Array.from({ length: n }, () => Array(n).fill(0));

        jobSkillsMap.forEach(skillSet => {
            const arr = Array.from(skillSet);
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr.length; j++) {
                    if (i !== j) {
                        const idx1 = topSkillNames.indexOf(arr[i]);
                        const idx2 = topSkillNames.indexOf(arr[j]);
                        if (idx1 !== -1 && idx2 !== -1) {
                            matrix[idx1][idx2] += 1;
                        }
                    }
                }
            }
        });

        return {
            labels: topSkillNames,
            matrix
        };
    }
}

// =====================================================================
// CLASS 3: Salary Analytics Engine
// =====================================================================
class SalaryAnalyticsEngine {
    static analyzeByRole(jobs) {
        const valid = jobs.filter(j => j.salary_min !== null && j.salary_max !== null && j.salary_min !== undefined && j.salary_max !== undefined);
        if (valid.length === 0) return [];

        const groups = {};
        valid.forEach(j => {
            const role = j.normalized_title || 'Software Engineer';
            if (!groups[role]) {
                groups[role] = { mins: [], maxs: [], mids: [] };
            }
            const mid = (j.salary_min + j.salary_max) / 2.0;
            groups[role].mins.push(j.salary_min);
            groups[role].maxs.push(j.salary_max);
            groups[role].mids.push(mid);
        });

        const result = [];
        for (const [role, data] of Object.entries(groups)) {
            const avgMin = Math.round(data.mins.reduce((a, b) => a + b, 0) / data.mins.length);
            const avgMax = Math.round(data.maxs.reduce((a, b) => a + b, 0) / data.maxs.length);

            // Median
            const sortedMids = [...data.mids].sort((a, b) => a - b);
            const midIdx = Math.floor(sortedMids.length / 2);
            const medianVal = sortedMids.length % 2 !== 0 
                ? sortedMids[midIdx] 
                : (sortedMids[midIdx - 1] + sortedMids[midIdx]) / 2;

            result.push({
                normalized_title: role,
                avg_min: avgMin,
                avg_max: avgMax,
                median_salary: Math.round(medianVal),
                job_count: data.mids.length
            });
        }

        return result.sort((a, b) => b.median_salary - a.median_salary);
    }

    static analyzeByExperience(jobs) {
        const valid = jobs.filter(j => j.salary_min !== null && j.salary_max !== null && j.salary_min !== undefined && j.salary_max !== undefined);
        if (valid.length === 0) return [];

        const groups = {};
        valid.forEach(j => {
            const exp = j.experience_level || 'Not Specified';
            if (!groups[exp]) {
                groups[exp] = { mins: [], maxs: [], mids: [] };
            }
            const mid = (j.salary_min + j.salary_max) / 2.0;
            groups[exp].mins.push(j.salary_min);
            groups[exp].maxs.push(j.salary_max);
            groups[exp].mids.push(mid);
        });

        const result = [];
        for (const [exp, data] of Object.entries(groups)) {
            const avgSalary = Math.round(data.mids.reduce((a, b) => a + b, 0) / data.mids.length);
            const minSalary = Math.min(...data.mins);
            const maxSalary = Math.max(...data.maxs);

            result.push({
                experience_level: exp,
                avg_salary: avgSalary,
                min_salary: minSalary,
                max_salary: maxSalary,
                count: data.mids.length
            });
        }

        return result.sort((a, b) => a.avg_salary - b.avg_salary);
    }
}

// =====================================================================
// CLASS 4: Location Analytics Engine
// =====================================================================
class LocationAnalyticsEngine {
    static analyzeDistribution(jobs) {
        if (!jobs || jobs.length === 0) return [];
        const counts = {};
        jobs.forEach(j => {
            const city = j.location || 'Khác';
            counts[city] = (counts[city] || 0) + 1;
        });

        return Object.entries(counts).map(([city, job_count]) => ({ city, job_count }));
    }
}

// =====================================================================
// CLASS 5: Master Job Analyzer Facade
// =====================================================================
class JobAnalyzer {
    constructor(jobs = [], skills = []) {
        this.jobs = jobs;
        this.skills = skills;
        this.kpiCalc = KpiMetricsCalculator;
        this.skillEngine = SkillAnalyticsEngine;
        this.salaryEngine = SalaryAnalyticsEngine;
        this.locationEngine = LocationAnalyticsEngine;
    }

    getKpiSummary() {
        return this.kpiCalc.calculateSummary(this.jobs, this.skills);
    }

    getTopSkills(topN = 15, roleFilter = null) {
        return this.skillEngine.getTopSkills(this.jobs, this.skills, topN, roleFilter);
    }

    getSalaryByRole() {
        return this.salaryEngine.analyzeByRole(this.jobs);
    }

    getSalaryByExperience() {
        return this.salaryEngine.analyzeByExperience(this.jobs);
    }

    getLocationDistribution() {
        return this.locationEngine.analyzeDistribution(this.jobs);
    }

    getSkillCooccurrence(topN = 8) {
        return this.skillEngine.getCooccurrenceMatrix(this.skills, topN);
    }
}

module.exports = {
    KpiMetricsCalculator,
    SkillAnalyticsEngine,
    SalaryAnalyticsEngine,
    LocationAnalyticsEngine,
    JobAnalyzer
};
