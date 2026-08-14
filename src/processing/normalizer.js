const USD_TO_VND_RATE = 25000;

const TECH_TAXONOMY = {
    // Languages
    "Python": { pattern: /\bpython\b/i, category: "Programming Language" },
    "Java": { pattern: /\bjava\b(?!script)/i, category: "Programming Language" },
    "JavaScript": { pattern: /\b(javascript|js)\b/i, category: "Programming Language" },
    "TypeScript": { pattern: /\b(typescript|ts)\b/i, category: "Programming Language" },
    "C++": { pattern: /\bc\+\+\b/i, category: "Programming Language" },
    "C#": { pattern: /\bc#|\b\.net\b/i, category: "Programming Language" },
    "Go": { pattern: /\b(go|golang)\b/i, category: "Programming Language" },
    "PHP": { pattern: /\bphp\b/i, category: "Programming Language" },
    "Ruby": { pattern: /\bruby\b/i, category: "Programming Language" },
    "Swift": { pattern: /\bswift\b/i, category: "Programming Language" },
    "Kotlin": { pattern: /\bkotlin\b/i, category: "Programming Language" },
    "Dart": { pattern: /\bdart\b/i, category: "Programming Language" },
    "Rust": { pattern: /\brust\b/i, category: "Programming Language" },

    // Frameworks & Web
    "React": { pattern: /\breact(\.?js)?\b/i, category: "Framework" },
    "Next.js": { pattern: /\bnext(\.?js)?\b/i, category: "Framework" },
    "Vue.js": { pattern: /\bvue(\.?js)?\b/i, category: "Framework" },
    "Angular": { pattern: /\bangular\b/i, category: "Framework" },
    "Node.js": { pattern: /\bnode(\.?js)?\b/i, category: "Framework" },
    "Django": { pattern: /\bdjango\b/i, category: "Framework" },
    "FastAPI": { pattern: /\bfastapi\b/i, category: "Framework" },
    "Flask": { pattern: /\bflask\b/i, category: "Framework" },
    "Spring Boot": { pattern: /\bspring\s?boot\b/i, category: "Framework" },
    "Express": { pattern: /\bexpress(\.?js)?\b/i, category: "Framework" },
    "Flutter": { pattern: /\bflutter\b/i, category: "Framework" },
    "React Native": { pattern: /\breact\s?native\b/i, category: "Framework" },
    "TailwindCSS": { pattern: /\btailwind(css)?\b/i, category: "Framework" },

    // Databases & Data Tools
    "SQL": { pattern: /\bsql\b/i, category: "Database & Data" },
    "PostgreSQL": { pattern: /\b(postgresql|postgres)\b/i, category: "Database & Data" },
    "MySQL": { pattern: /\bmysql\b/i, category: "Database & Data" },
    "MongoDB": { pattern: /\bmongodb\b/i, category: "Database & Data" },
    "Redis": { pattern: /\bredis\b/i, category: "Database & Data" },
    "PySpark": { pattern: /\b(pyspark|spark)\b/i, category: "Database & Data" },
    "Hadoop": { pattern: /\bhadoop\b/i, category: "Database & Data" },
    "Airflow": { pattern: /\bairflow\b/i, category: "Database & Data" },
    "Kafka": { pattern: /\bkafka\b/i, category: "Database & Data" },
    "Snowflake": { pattern: /\bsnowflake\b/i, category: "Database & Data" },
    "Databricks": { pattern: /\bdatabricks\b/i, category: "Database & Data" },
    "Pandas": { pattern: /\bpandas\b/i, category: "Database & Data" },
    "PowerBI": { pattern: /\bpower\s?bi\b/i, category: "Database & Data" },
    "Tableau": { pattern: /\btableau\b/i, category: "Database & Data" },

    // Cloud & DevOps
    "AWS": { pattern: /\baws|amazon web services\b/i, category: "Cloud & DevOps" },
    "Azure": { pattern: /\bazure\b/i, category: "Cloud & DevOps" },
    "GCP": { pattern: /\b(gcp|google cloud)\b/i, category: "Cloud & DevOps" },
    "Docker": { pattern: /\bdocker\b/i, category: "Cloud & DevOps" },
    "Kubernetes": { pattern: /\b(k8s|kubernetes)\b/i, category: "Cloud & DevOps" },
    "Terraform": { pattern: /\bterraform\b/i, category: "Cloud & DevOps" },
    "CI/CD": { pattern: /\bci\/?cd\b/i, category: "Cloud & DevOps" },
    "Linux": { pattern: /\blinux\b/i, category: "Cloud & DevOps" },
    "Git": { pattern: /\bgit\b/i, category: "Cloud & DevOps" },

    // AI & Testing
    "PyTorch": { pattern: /\bpytorch\b/i, category: "AI & Machine Learning" },
    "TensorFlow": { pattern: /\btensorflow\b/i, category: "AI & Machine Learning" },
    "Scikit-learn": { pattern: /\bscikit-learn\b/i, category: "AI & Machine Learning" },
    "NLP": { pattern: /\bnlp\b/i, category: "AI & Machine Learning" },
    "Selenium": { pattern: /\bselenium\b/i, category: "QA & Testing" },
    "Cypress": { pattern: /\bcypress\b/i, category: "QA & Testing" },
    "Jira": { pattern: /\bjira\b/i, category: "Management & Tools" }
};

// =====================================================================
// CLASS 1: Salary Normalizer
// =====================================================================
class SalaryNormalizer {
    parseSalary(rawSalary) {
        if (!rawSalary || rawSalary.toLowerCase().includes("thỏa thuận") || rawSalary.toLowerCase().includes("thương lượng")) {
            return { salary_min: null, salary_max: null, currency: "USD" };
        }

        const rawClean = rawSalary.replace(/,/g, '').replace(/\./g, '').trim().toLowerCase();

        // 1. Parsing dải USD ($1500 - $2500)
        const usdRangeMatch = rawClean.match(/\$?(\d+)\s*-\s*\$?(\d+)\s*(usd|\$)?/i);
        if (usdRangeMatch && (rawClean.includes('$') || rawClean.includes('usd'))) {
            const val1 = parseFloat(usdRangeMatch[1]);
            const val2 = parseFloat(usdRangeMatch[2]);
            return {
                salary_min: Math.min(val1, val2),
                salary_max: Math.max(val1, val2),
                currency: "USD"
            };
        }

        // 2. Parsing dải triệu VNĐ (20 - 35 triệu)
        const vndRangeMatch = rawClean.match(/(\d+)\s*-\s*(\d+)\s*(triệu|trieu|tr)/i);
        if (vndRangeMatch) {
            const minVndMil = parseFloat(vndRangeMatch[1]);
            const maxVndMil = parseFloat(vndRangeMatch[2]);
            const minUsd = Math.round((minVndMil * 1000000) / USD_TO_VND_RATE);
            const maxUsd = Math.round((maxVndMil * 1000000) / USD_TO_VND_RATE);
            return {
                salary_min: minUsd,
                salary_max: maxUsd,
                currency: "USD"
            };
        }

        // 3. Parsing "Up to $3000" hoặc "Up to 60 triệu"
        const upToUsd = rawClean.match(/(up to|lên đến|đến)\s*\$?(\d+)\s*(usd|\$)?/i);
        if (upToUsd && (rawClean.includes('$') || rawClean.includes('usd'))) {
            const maxVal = parseFloat(upToUsd[2]);
            return {
                salary_min: Math.round(maxVal * 0.6),
                salary_max: maxVal,
                currency: "USD"
            };
        }

        const upToVnd = rawClean.match(/(up to|lên đến|đến)\s*(\d+)\s*(triệu|trieu|tr)/i);
        if (upToVnd) {
            const maxVndMil = parseFloat(upToVnd[2]);
            const maxUsd = Math.round((maxVndMil * 1000000) / USD_TO_VND_RATE);
            return {
                salary_min: Math.round(maxUsd * 0.6),
                salary_max: maxUsd,
                currency: "USD"
            };
        }

        return { salary_min: null, salary_max: null, currency: "USD" };
    }
}

// =====================================================================
// CLASS 2: Skill Extractor Engine
// =====================================================================
class SkillExtractor {
    constructor(taxonomy = TECH_TAXONOMY) {
        this.taxonomy = taxonomy;
    }

    extract(text) {
        const extracted = [];
        if (!text) return extracted;
        const textLower = text.toLowerCase();

        for (const [skillName, config] of Object.entries(this.taxonomy)) {
            if (config.pattern.test(textLower)) {
                extracted.push({
                    name: skillName,
                    category: config.category
                });
            }
        }
        return extracted;
    }
}

// =====================================================================
// CLASS 3: Job Title Normalizer
// =====================================================================
class JobTitleNormalizer {
    normalize(title) {
        if (!title) return 'Software Engineer';
        const tLower = title.toLowerCase();

        if (['data engineer', 'kỹ sư dữ liệu', 'pyspark'].some(k => tLower.includes(k))) {
            return 'Data Engineer';
        } else if (['data analyst', 'bi analyst', 'phân tích dữ liệu'].some(k => tLower.includes(k))) {
            return 'Data Analyst';
        } else if (['ai engineer', 'machine learning', 'data scientist', 'mlops'].some(k => tLower.includes(k))) {
            return 'AI / Data Science Engineer';
        } else if (['backend', 'golang', 'java developer', 'python developer', 'c#'].some(k => tLower.includes(k))) {
            return 'Backend Engineer';
        } else if (['frontend', 'react', 'vue', 'angular'].some(k => tLower.includes(k))) {
            return 'Frontend Engineer';
        } else if (['fullstack', 'full-stack'].some(k => tLower.includes(k))) {
            return 'Fullstack Engineer';
        } else if (['devops', 'cloud', 'system admin', 'kubernetes'].some(k => tLower.includes(k))) {
            return 'DevOps & Cloud Engineer';
        } else if (['mobile', 'ios', 'android', 'flutter'].some(k => tLower.includes(k))) {
            return 'Mobile Developer';
        } else if (['qa', 'tester', 'automation'].some(k => tLower.includes(k))) {
            return 'QA / Automation Engineer';
        } else {
            return 'Software Engineer';
        }
    }
}

// =====================================================================
// CLASS 4: Experience Level Normalizer
// =====================================================================
class ExperienceNormalizer {
    normalize(expRaw) {
        const eLower = String(expRaw || '').toLowerCase();

        if (['chưa', 'fresh', 'dưới 1', 'intern'].some(k => eLower.includes(k))) {
            return 'Fresher / Intern (0-1 yrs)';
        } else if (['1 - 2', '1-2', 'junior'].some(k => eLower.includes(k))) {
            return 'Junior (1-2 yrs)';
        } else if (['2 - 4', '2-4', 'mid'].some(k => eLower.includes(k))) {
            return 'Mid-Level (2-4 yrs)';
        } else if (['senior', '4 - 7', '4-7'].some(k => eLower.includes(k))) {
            return 'Senior (4-7 yrs)';
        } else if (['lead', 'principal', '7+', 'manager'].some(k => eLower.includes(k))) {
            return 'Lead / Manager (7+ yrs)';
        } else {
            return 'Mid-Level (2-4 yrs)';
        }
    }
}

// =====================================================================
// CLASS 5: Master Data Normalizer Facade
// =====================================================================
class DataNormalizer {
    constructor() {
        this.salaryNormalizer = new SalaryNormalizer();
        this.skillExtractor = new SkillExtractor();
        this.titleNormalizer = new JobTitleNormalizer();
        this.expNormalizer = new ExperienceNormalizer();
    }

    normalizeSalary(rawSalary) {
        return this.salaryNormalizer.parseSalary(rawSalary);
    }

    extractSkills(text) {
        return this.skillExtractor.extract(text);
    }

    normalizeTitle(title) {
        return this.titleNormalizer.normalize(title);
    }

    normalizeExperience(expRaw) {
        return this.expNormalizer.normalize(expRaw);
    }
}

module.exports = {
    SalaryNormalizer,
    SkillExtractor,
    JobTitleNormalizer,
    ExperienceNormalizer,
    DataNormalizer,
    TECH_TAXONOMY
};
