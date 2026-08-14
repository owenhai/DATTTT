const ExcelJS = require('exceljs');

class ExcelService {
    /**
     * Tạo workbook Excel báo cáo tuyển dụng IT
     * @param {Array<Object>} jobs Danh sách bài tuyển dụng
     * @param {Array<Object>} skills Danh sách kỹ năng tương ứng
     * @param {Object} kpis Object chứa KPI tổng quan
     * @param {Array<Object>} topSkills Danh sách top kỹ năng
     * @returns {Promise<Buffer>} Buffer của file Excel (.xlsx)
     */
    async generateJobsReport(jobs = [], skills = [], kpis = {}, topSkills = []) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Tech Job Analytics System';
        workbook.created = new Date();

        // -----------------------------------------------------------------
        // SHEET 1: DANH SÁCH BÀI TUYỂN DỤNG
        // -----------------------------------------------------------------
        const sheetJobs = workbook.addWorksheet('Danh Sách Bài Tuyển Dụng', {
            views: [{ showGridLines: true }]
        });

        // Gom nhóm kỹ năng theo job_id
        const skillMap = new Map();
        for (const s of skills) {
            if (!skillMap.has(s.job_id)) {
                skillMap.set(s.job_id, []);
            }
            skillMap.get(s.job_id).push(s.skill_name);
        }

        // Định nghĩa cột cho Sheet Jobs
        sheetJobs.columns = [
            { header: 'Mã Job', key: 'job_id', width: 10 },
            { header: 'Tiêu Đề Bài Tuyển Dụng', key: 'title', width: 35 },
            { header: 'Vị Trí Chuẩn Hóa', key: 'normalized_title', width: 22 },
            { header: 'Công Ty Tuyển Dụng', key: 'company_name', width: 28 },
            { header: 'Địa Điểm', key: 'location', width: 16 },
            { header: 'Lương Min ($)', key: 'salary_min', width: 14 },
            { header: 'Lương Max ($)', key: 'salary_max', width: 14 },
            { header: 'Lương Nguyên Bản', key: 'raw_salary', width: 20 },
            { header: 'Kinh Nghiệm', key: 'experience_level', width: 20 },
            { header: 'Kỹ Năng Yêu Cầu', key: 'skills_str', width: 35 },
            { header: 'Nguồn Cào', key: 'source_platform', width: 20 },
            { header: 'Link Bài Đăng', key: 'source_url', width: 45 }
        ];

        // Format Header Row
        const headerRow = sheetJobs.getRow(1);
        headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1E3A8A' } // Deep Navy Blue
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 28;

        // Thêm các dòng dữ liệu Jobs
        jobs.forEach((j, index) => {
            const jobSkills = skillMap.get(j.job_id) || [];
            const row = sheetJobs.addRow({
                job_id: j.job_id || (index + 1),
                title: j.title || '',
                normalized_title: j.normalized_title || '',
                company_name: j.company_name || 'N/A',
                location: j.location || 'N/A',
                salary_min: j.salary_min !== null ? j.salary_min : '',
                salary_max: j.salary_max !== null ? j.salary_max : '',
                raw_salary: j.raw_salary || '',
                experience_level: j.experience_level || '',
                skills_str: jobSkills.join(', '),
                source_platform: j.source_platform || '',
                source_url: j.source_url || ''
            });

            // Alternate row background color
            if (index % 2 === 1) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'F8FAFC' }
                };
            }
            row.alignment = { vertical: 'middle' };
        });

        // -----------------------------------------------------------------
        // SHEET 2: BÁO CÁO THỐNG KÊ & KPIS
        // -----------------------------------------------------------------
        const sheetKpis = workbook.addWorksheet('Báo Cáo Thống Kê KPI', {
            views: [{ showGridLines: true }]
        });

        // Title Header
        sheetKpis.mergeCells('A1:D1');
        const titleCell = sheetKpis.getCell('A1');
        titleCell.value = 'BÁO CÁO THỐNG KÊ THỊ TRƯỜNG TUYỂN DỤNG IT';
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: '1E3A8A' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        sheetKpis.getRow(1).height = 35;

        // KPI Summary Table
        sheetKpis.addRow([]);
        const kpiHeader = sheetKpis.addRow(['Chỉ Số KPI Thống Kê', 'Giá Trị']);
        kpiHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
        kpiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };

        sheetKpis.addRow(['Tổng số tin tuyển dụng', kpis.total_jobs || jobs.length]);
        sheetKpis.addRow(['Tổng số công ty tuyển dụng', kpis.total_companies || 0]);
        sheetKpis.addRow(['Mức lương trung bình (USD/Tháng)', `$${(kpis.avg_salary_usd || 0).toLocaleString()}`]);
        sheetKpis.addRow(['Kỹ năng hot nhất thị trường', kpis.top_skill || 'N/A']);

        // Top Skills Table
        sheetKpis.addRow([]);
        sheetKpis.addRow([]);
        const skillsHeader = sheetKpis.addRow(['Top Kỹ Năng Hot Nhất', 'Số Lượng Nhu Cầu', 'Tỷ Lệ (%)']);
        skillsHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
        skillsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } };

        const totalJobsCount = kpis.total_jobs || jobs.length || 1;
        topSkills.forEach(s => {
            const pct = ((s.count / totalJobsCount) * 100).toFixed(1);
            sheetKpis.addRow([s.name, s.count, `${pct}%`]);
        });

        // Adjust Column Widths for Sheet 2
        sheetKpis.columns = [
            { width: 35 },
            { width: 25 },
            { width: 18 },
            { width: 15 }
        ];

        // Xuất file dạng Buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
}

module.exports = ExcelService;
