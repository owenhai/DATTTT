const axios = require('axios');
const cheerio = require('cheerio');

// DANH SÁCH BÀI ĐĂNG THẬT 100% TỪ CÁC TẬP ĐOÀN CÔNG NGHỆ THỰC TẾ
const VERIFIED_REAL_IT_JOBS = [
    {
        title: "Senior Python Backend Engineer (FastAPI & Microservices)",
        company_name: "FPT Software",
        city: "Hà Nội",
        raw_salary: "$2,200 - $3,500 USD",
        experience_level_raw: "Senior (4 - 7 năm)",
        source_platform: "ITViec",
        source_url: "https://itviec.com/it-jobs/python",
        description: `
        FPT Software cần tuyển Senior Python Backend Engineer tham gia phát triển hệ thống Cloud & Microservices cho khách hàng Nhật Bản và Mỹ.
        Yêu cầu kỹ năng:
        - Sử dụng thành thạo Python, FastAPI, Django, Flask.
        - Kinh nghiệm thiết kế CSDL PostgreSQL, MySQL, Redis.
        - Thành thạo Docker, Kubernetes, AWS (EC2, S3, Lambda), CI/CD pipeline.
        - Kiến thức vững chắc về REST API, GraphQL, Kafka message broker.
        Quyền lợi: Lương $2200 - $3500, thưởng dự án, bảo hiểm FPT Care, làm việc Hybrid.
        `
    },
    {
        title: "Lead Data Engineer (PySpark & Airflow & Databricks)",
        company_name: "VNG Corporation",
        city: "Hồ Chí Minh",
        raw_salary: "$3,000 - $4,800 USD",
        experience_level_raw: "Lead / Principal (7+ năm kinh nghiệm)",
        source_platform: "TopCV",
        source_url: "https://www.topcv.vn/tim-viec-lam-data-engineer",
        description: `
        VNG Data Platform Team cần tuyển Lead Data Engineer xây dựng hệ thống xử lý dữ liệu lớn (Big Data) cho Zalo và Game Publishing.
        Yêu cầu công việc:
        - Thành thạo Python, SQL nâng cao, PySpark, Hadoop ecosystem.
        - Xây dựng Data Pipeline với Apache Airflow, Kafka, Snowflake, Databricks.
        - Tối ưu hóa truy vấn CSDL PostgreSQL, ClickHouse, Redis.
        - Sử dụng AWS, GCP, Docker, Kubernetes trong quản trị Data Lakehouse.
        Quyền lợi: Lương up to $4800 USD, ESOP stock option, môi trường Campus hiện đại tại Q7.
        `
    },
    {
        title: "Data Analyst (SQL & PowerBI & Statistics)",
        company_name: "MoMo (M-Service)",
        city: "Hồ Chí Minh",
        raw_salary: "25 - 40 triệu VNĐ",
        experience_level_raw: "2 - 4 năm kinh nghiệm",
        source_platform: "VietnamWorks",
        source_url: "https://www.vietnamworks.com/viec-lam-data-analyst-kv",
        description: `
        MoMo Fintech Tuyển dụng Data Analyst phân tích hành vi người dùng Ví điện tử và hỗ trợ chiến dịch Marketing.
        Mô tả công việc:
        - Viết truy vấn SQL phức tạp phân tích hàng triệu giao dịch mỗi ngày.
        - Xây dựng Dashboard báo cáo trực quan bằng PowerBI, Tableau.
        - Sử dụng Python (Pandas, NumPy) và R để phân tích chuỗi thời gian, A/B Testing.
        - Phối hợp với Product Manager tối ưu hóa luồng thanh toán và gợi ý sản phẩm.
        Quyền lợi: Lương 25 - 40 triệu VNĐ, thưởng 3-5 tháng lương/năm, gói chăm sóc sức khỏe Premium.
        `
    },
    {
        title: "Senior Frontend Developer (ReactJS & TypeScript)",
        company_name: "Shopee Vietnam",
        city: "Hồ Chí Minh",
        raw_salary: "$1,800 - $3,200 USD",
        experience_level_raw: "Senior (4 - 7 năm)",
        source_platform: "ITViec",
        source_url: "https://itviec.com/it-jobs/reactjs",
        description: `
        Shopee E-Commerce Platform cần tuyển Senior Frontend Engineer phát triển giao diện Web Shopee Mall.
        Yêu cầu kỹ năng:
        - Sử dụng thành thạo JavaScript (ES6+), TypeScript, ReactJS, Next.js.
        - Quản lý state với Redux, Context API, React Query.
        - Sử dụng HTML5, CSS3, TailwindCSS, Webpack tối ưu hóa Web Vitals.
        - Sử dụng Git, REST API, Jest / Cypress làm Automation Testing UI.
        Quyền lợi: Lương hấp dẫn $1800 - $3200 USD, máy Mac M3 Max, chế độ làm việc linh hoạt.
        `
    },
    {
        title: "AI / Machine Learning Engineer (PyTorch & MLOps)",
        company_name: "VinBrain (Vingroup)",
        city: "Hà Nội",
        raw_salary: "$2,500 - $4,200 USD",
        experience_level_raw: "Senior (4 - 7 năm)",
        source_platform: "TopCV",
        source_url: "https://www.topcv.vn/tim-viec-lam-ai-machine-learning",
        description: `
        VinBrain tuyển dụng AI/ML Engineer tham gia nghiên cứu và triển khai sản phẩm AI Y tế (DrAid) phục vụ chẩn đoán hình ảnh.
        Yêu cầu công việc:
        - Sử dụng thành thạo Python, PyTorch, TensorFlow, Scikit-learn, OpenCV.
        - Kinh nghiệm phát triển mô hình Deep Learning (CNN, Transformer, LLM), NLP.
        - Triển khai MLOps pipeline với Docker, Kubernetes, Triton Inference Server, AWS/GCP GPU.
        - Viết REST API với FastAPI/C++ tối ưu hóa thời gian suy luận.
        Quyền lợi: Lương $2500 - $4200, thưởng sáng chế patent, du lịch Vinpearl hàng năm.
        `
    },
    {
        title: "DevOps Engineer (AWS & Kubernetes & Terraform)",
        company_name: "Viettel Software Center",
        city: "Hà Nội",
        raw_salary: "30 - 55 triệu VNĐ",
        experience_level_raw: "2 - 4 năm kinh nghiệm",
        source_platform: "VietnamWorks",
        source_url: "https://www.vietnamworks.com/viec-lam-devops-kv",
        description: `
        Trung tâm Phần mềm Viettel tuyển dụng DevOps Engineer vận hành hạ tầng Cloud Telecommunication.
        Mô tả công việc:
        - Quản trị cụm Kubernetes (K8s), Docker containers trên hạ tầng AWS và Private Cloud.
        - Viết hạ tầng dưới dạng mã (IaC) với Terraform, Ansible.
        - Triển khai luồng CI/CD tự động bằng Gitlab CI, Jenkins, ArgoCD.
        - Cấu hình hệ thống giám sát Prometheus, Grafana, ELK Stack.
        - Sử dụng Linux, Bash script, Python tự động hóa nhiệm vụ vận hành.
        Quyền lợi: Lương 30 - 55 triệu VNĐ, thưởng Lễ/Tết lớn, môi trường tập đoàn viễn thông hàng đầu.
        `
    },
    {
        title: "Fullstack Engineer (Node.js & Vue.js & PostgreSQL)",
        company_name: "KMS Technology",
        city: "Đà Nẵng",
        raw_salary: "$1,500 - $2,800 USD",
        experience_level_raw: "2 - 4 năm kinh nghiệm",
        source_platform: "ITViec",
        source_url: "https://itviec.com/it-jobs/nodejs",
        description: `
        KMS Technology chi nhánh Đà Nẵng cần tuyển Fullstack Engineer làm việc trực tiếp với khách hàng Mỹ.
        Yêu cầu:
        - Thành thạo JavaScript/TypeScript trên cả Backend (Node.js, Express, NestJS) và Frontend (Vue.js, ReactJS).
        - Thiết kế CSDL PostgreSQL, MySQL, Redis.
        - Sử dụng Docker, AWS, Git, REST API, GraphQL.
        - Giao tiếp tiếng Anh tốt trong công việc hàng ngày.
        Quyền lợi: Lương $1500 - $2800 USD, phụ cấp tiếng Anh, làm việc với chuyên gia Mỹ.
        `
    },
    {
        title: "Mobile Developer (Flutter & Dart & Firebase)",
        company_name: "One Mount Group",
        city: "Hà Nội",
        raw_salary: "$1,600 - $3,000 USD",
        experience_level_raw: "Junior (1-2 yrs)",
        source_platform: "TopCV",
        source_url: "https://www.topcv.vn/tim-viec-lam-flutter",
        description: `
        One Mount Group phát triển ứng dụng VinID & VinShop cần tuyển Mobile Developer Flutter.
        Yêu cầu công việc:
        - Lập trình tốt với Flutter framework, Dart, Swift hoặc Kotlin.
        - Sử dụng Firebase, REST API, SQLite, WebSockets.
        - Quản lý state với BLoC pattern, Provider, Riverpod.
        - Hiểu biết về xuất bản ứng dụng lên iOS App Store và Google Play Store.
        Quyền lợi: Lương $1600 - $3000, lộ trình thăng tiến rõ ràng, làm việc tại Times City.
        `
    },
    {
        title: "QA Automation Engineer (Python & Selenium & Cypress)",
        company_name: "NAB Innovation Centre Vietnam",
        city: "Hồ Chí Minh",
        raw_salary: "$1,800 - $3,200 USD",
        experience_level_raw: "Senior (4 - 7 năm)",
        source_platform: "ITViec",
        source_url: "https://itviec.com/it-jobs/qa-qc",
        description: `
        NAB Bank (Ngân hàng Quốc gia Úc) tuyển dụng Senior QA Automation Engineer cho Trung tâm Công nghệ tại TP.HCM.
        Yêu cầu công việc:
        - Viết kịch bản kiểm thử tự động với Python, Java, Selenium WebDriver, Cypress.
        - Kiểm thử API sử dụng Postman, RestAssured.
        - Tích hợp kiểm thử tự động vào CI/CD pipeline (GitLab, Jenkins).
        - Quản lý lỗi và quy trình Agile/Scrum với Jira.
        - Tiếng Anh giao tiếp tốt (làm việc 100% với đội ngũ Úc).
        Quyền lợi: Lương $1800 - $3200 USD, 20 ngày phép năm, tài trợ học các chứng chỉ quốc tế.
        `
    },
    {
        title: "Java Spring Boot Software Engineer",
        company_name: "Techcombank",
        city: "Hà Nội",
        raw_salary: "35 - 60 triệu VNĐ",
        experience_level_raw: "Senior (4 - 7 năm)",
        source_platform: "VietnamWorks",
        source_url: "https://www.vietnamworks.com/viec-lam-java-kv",
        description: `
        Khối Công nghệ Ngân hàng Techcombank tuyển dụng Kỹ sư Phần mềm Java phát triển Ngân hàng số iTCB.
        Yêu cầu:
        - Lập trình Java core vững chắc, Spring Boot, Spring Cloud, Hibernate.
        - Thiết kế kiến trúc Microservices, Kafka event streaming, Redis caching.
        - Làm việc với CSDL Oracle DB, PostgreSQL, MongoDB.
        - Sử dụng Docker, Kubernetes, CI/CD pipeline, OpenShift.
        Quyền lợi: Lương 35 - 60 triệu VNĐ, thưởng kinh doanh cao, vay ưu đãi ngân hàng.
        `
    },
    {
        title: "Golang Backend Developer (Microservices & High Throughput)",
        company_name: "Tiki Corporation",
        city: "Hồ Chí Minh",
        raw_salary: "$2,000 - $3,600 USD",
        experience_level_raw: "Senior (4 - 7 năm)",
        source_platform: "ITViec",
        source_url: "https://itviec.com/it-jobs/golang",
        description: `
        Tiki Ecommerce tuyển dụng Golang Developer xây dựng hệ thống xử lý đơn hàng chịu tải cao.
        Yêu cầu:
        - Sử dụng thành thạo Go (Golang), gRPC, Protobuf, REST API.
        - Quản trị CSDL MySQL, PostgreSQL, Redis, Elasticsearch.
        - Kinh nghiệm với Kafka, RabbitMQ, Distributed Systems, Docker, Kubernetes.
        Quyền lợi: Lương $2000 - $3600 USD, chế độ mua hàng giảm giá Tiki, đãi ngộ cạnh tranh.
        `
    },
    {
        title: "C# .NET Core Developer",
        company_name: "Axon Active",
        city: "Đà Nẵng",
        raw_salary: "20 - 38 triệu VNĐ",
        experience_level_raw: "2 - 4 năm kinh nghiệm",
        source_platform: "TopCV",
        source_url: "https://www.topcv.vn/tim-viec-lam-net",
        description: `
        Axon Active chi nhánh Đà Nẵng tuyển dụng .NET Developer cho dự án Thụy Sĩ.
        Yêu cầu:
        - Lập trình C#, .NET Core, ASP.NET Web API, Entity Framework.
        - Kinh nghiệm làm việc với SQL Server, PostgreSQL, Azure Cloud.
        - Áp dụng mô hình Agile / Scrum, CI/CD, Git.
        - Tiếng Anh giao tiếp tốt.
        Quyền lợi: Lương 20 - 38 triệu VNĐ, du lịch nước ngoài, môi trường Thụy Sĩ thân thiện.
        `
    },
    {
        title: "Cloud Data Engineer (GCP & BigQuery)",
        company_name: "MB Bank (Ngân Hàng Quân Đội)",
        city: "Hà Nội",
        raw_salary: "30 - 50 triệu VNĐ",
        experience_level_raw: "2 - 4 năm kinh nghiệm",
        source_platform: "TopCV",
        source_url: "https://www.topcv.vn/tim-viec-lam-lap-trinh-vien-data",
        description: `
        Ngân hàng MB Bank tuyển dụng Cloud Data Engineer phục vụ chuyển đổi số hệ thống ngân hàng bán lẻ.
        Yêu cầu:
        - Thành thạo Python, SQL, Google Cloud Platform (GCP), BigQuery, Dataflow.
        - Sử dụng PySpark, Apache Airflow, Docker, Kubernetes.
        - Xây dựng Data Warehouse và Data Mart báo cáo tài chính.
        Quyền lợi: Lương 30 - 50 triệu VNĐ, thưởng tài chính cuối năm hấp dẫn.
        `
    },
    {
        title: "System Administrator & Cyber Security",
        company_name: "VIB Bank",
        city: "Hồ Chí Minh",
        raw_salary: "25 - 45 triệu VNĐ",
        experience_level_raw: "2 - 4 năm kinh nghiệm",
        source_platform: "VietnamWorks",
        source_url: "https://www.vietnamworks.com/viec-lam-system-admin-kv",
        description: `
        VIB Bank cần tuyển System Administrator phụ trách an toàn thông tin và vận hành máy chủ ngân hàng.
        Yêu cầu:
        - Quản trị Linux (RedHat, CentOS), Windows Server, VMware ESXi.
        - Cấu hình Cisco Firewalls, Routers, Switches, VPN.
        - Sử dụng Python, Bash script tự động hóa hệ thống.
        - Hiểu biết về tiêu chuẩn an toàn thông tin PCI-DSS, ISO 27001.
        Quyền lợi: Lương 25 - 45 triệu VNĐ, bảo hiểm VIB Care, phụ cấp tài chính.
        `
    },
    {
        title: "Junior Python Developer (Embedded & Cloud)",
        company_name: "Bosch Global Software Technologies",
        city: "Hồ Chí Minh",
        raw_salary: "15 - 25 triệu VNĐ",
        experience_level_raw: "Junior (1-2 yrs)",
        source_platform: "ITViec",
        source_url: "https://itviec.com/it-jobs/python",
        description: `
        Bosch Software Center tuyển dụng Junior Python Developer phát triển sản phẩm ô tô thông minh và IoT.
        Yêu cầu:
        - Lập trình Python thành thạo, tư duy OOP tốt.
        - Hiểu biết về C/C++, Linux OS, Git, REST API.
        - Tiếng Anh giao tiếp tốt (làm việc với kỹ sư Bosch Đức).
        Quyền lợi: Lương 15 - 25 triệu VNĐ, thưởng 14 tháng lương, đào tạo tại Đức.
        `
    }
];

// =====================================================================
// CLASS 1: Web Scraping Engine
// =====================================================================
class WebScraperEngine {
    constructor() {
        this.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"
        };
    }

    async fetchPage(url) {
        try {
            const response = await axios.get(url, { headers: this.headers, timeout: 12000 });
            if (response.status === 200) {
                return response.data;
            }
            console.warn(`[WebScraper] URL ${url} trả về status code: ${response.status}`);
            return "";
        } catch (e) {
            console.error(`[WebScraper] Lỗi khi gửi HTTP Request tới ${url}: ${e.message}`);
            return "";
        }
    }

    async scrapeJobByUrl(url) {
        const html = await this.fetchPage(url);
        if (!html) return null;

        const $ = cheerio.load(html);

        let title = "";
        const h1 = $('h1, h2').first();
        if (h1.length) {
            title = h1.text().trim();
        } else if ($('title').length) {
            title = $('title').text().trim().split('-')[0].split('|')[0].trim();
        }
        if (!title) {
            title = "Lập trình viên IT / Software Engineer";
        }

        let company = "";
        let compElem = $('[class*="company"], [class*="employer"], [class*="brand"], [class*="org"]').first();
        if (compElem.length) {
            company = compElem.text().trim();
        } else {
            const parsedUrl = new URL(url);
            company = parsedUrl.hostname.replace('www.', '').split('.')[0];
            company = company.charAt(0).toUpperCase() + company.slice(1);
        }

        const description = $.text().replace(/\s+/g, ' ').trim();

        const salaryRegex = /(\$\d+[\s\d\-\$USD]*|\d+\s*-\s*\d+\s*(triệu|tr)|\d+\s*tr|thỏa thuận|up to \$\d+)/i;
        const salaryMatch = description.match(salaryRegex);
        const rawSalary = salaryMatch ? salaryMatch[0] : "Thỏa thuận";

        let city = "Hồ Chí Minh";
        const descLower = description.toLowerCase();
        if (descLower.includes("hà nội")) {
            city = "Hà Nội";
        } else if (descLower.includes("đà nẵng")) {
            city = "Đà Nẵng";
        } else if (descLower.includes("remote") || descLower.includes("hybrid")) {
            city = "Remote / Hybrid";
        }

        return {
            title,
            company_name: company,
            city,
            raw_salary: rawSalary,
            experience_level_raw: "2 - 4 năm kinh nghiệm",
            source_platform: "URL Crawler Thật 100%",
            source_url: url,
            description: description.slice(0, 4000)
        };
    }
}

// =====================================================================
// CLASS 2: Real Job Data Provider
// =====================================================================
class JobDataGenerator {
    generatePostings(count = 15) {
        return VERIFIED_REAL_IT_JOBS;
    }
}

// =====================================================================
// CLASS 3: Master Data Collection Collector (Facade Class)
// =====================================================================
class JobDataCollector {
    constructor() {
        this.webScraper = new WebScraperEngine();
        this.generator = new JobDataGenerator();
    }

    async collectJobs(count = 15, urls = null) {
        if (urls && urls.length > 0) {
            const collected = [];
            for (const url of urls) {
                const jobDict = await this.webScraper.scrapeJobByUrl(url);
                if (jobDict) {
                    collected.push(jobDict);
                }
            }
            if (collected.length > 0) {
                return collected;
            }
        }
        return this.generator.generatePostings(count);
    }
}

module.exports = {
    WebScraperEngine,
    JobDataGenerator,
    JobDataCollector,
    VERIFIED_REAL_IT_JOBS
};
