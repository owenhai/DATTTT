# Nghiên cứu và xây dựng hệ thống thu thập, phân tích dữ liệu tuyển dụng ngành Công nghệ thông tin.

Hệ thống phân tích thị trường tuyển dụng IT End-to-End xây dựng trên nền **Node.js**, kết nối CSDL MySQL / SQLite Fallback, tự động thu thập, chuẩn hóa dữ liệu ETL và hiển thị Bảng điều khiển (Web Dashboard SPA) trực quan tương tác.

---

## Các Tính Năng Chính

1. **Khảo sát & Thu thập Dữ liệu**: Scraper thu thập dữ liệu bài đăng tuyển dụng công nghệ (Tiêu đề, Công ty, Mức lương, Địa điểm, Mô tả công việc, Yêu cầu kỹ năng).
2. **Thiết kế & Lưu trữ CSDL**: Schema chuẩn hóa dạng quan hệ (3NF) gồm các bảng `jobs`, `companies`, `skills`, `locations` và `job_skills`. Hỗ trợ MySQL Server & SQLite Fallback (`tech_jobs_fallback.db`).
3. **Xử lý & Chuẩn hóa Dữ liệu (ETL)**:
   - Loại bỏ trùng lặp dữ liệu (Deduplication bằng mã Hash MD5).
   - Làm sạch văn bản HTML.
   - Trích xuất Kỹ năng Công nghệ: Sử dụng từ điển Regex nhận diện hơn 50+ kỹ năng (Python, React, AWS, PySpark, Docker, SQL...).
   - Chuẩn hóa Mức lương: Quy đổi các định dạng lương ($1500 - $2500, 25 - 50 triệu VNĐ, Up to...) về chuẩn dải lương USD/tháng.
   - Chuẩn hóa Vị trí & Cấp bậc kinh nghiệm.
4. **Bảng Điều Khiển Trực Quan (Interactive Web Dashboard - Express & Plotly.js)**:
   - Các thẻ KPI tổng quan (Tổng tin tuyển dụng, Số công ty, Lương trung bình, Top kỹ năng hot).
   - Biểu đồ xu hướng Kỹ năng hot nhất & Ma trận tương quan kỹ năng (Co-occurrence Heatmap).
   - Phân tích dải lương theo vị trí công việc & kinh nghiệm.
   - Bộ lọc động theo Địa điểm, Vị trí, Kinh nghiệm và Tìm kiếm từ khóa.
   - Công cụ Cào dữ liệu tự động từ link URL tuyển dụng thực tế.

---

## Hướng Dẫn Chạy Dự Án Trên Node.js

### Bước 1: Mở Dự Án
1. Mở phần mềm Visual Studio Code.
2. Chọn **File -> Open Folder...** và chọn thư mục `DATTTT`.

### Bước 2: Cài Đặt Các Thư Viện Node.js Cần Thiết
Mở Terminal trong VS Code (Ctrl + ~) và chạy lệnh:

```bash
npm install
```

---

### Bước 3: Cấu Hình Kết Nối CSDL (.env)

Chỉnh sửa tệp `.env` trong thư mục dự án với thông tin CSDL của bạn:

```ini
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mật_khẩu_mysql_của_bạn
DB_NAME=tech_jobs_db

ENABLE_SQLITE_FALLBACK=True
SQLITE_DB_PATH=tech_jobs_fallback.db
PORT=3000
```

---

### Bước 4: Chạy Luồng Dữ Liệu ETL & Lưu Vào CSDL

Chạy câu lệnh sau trong Terminal để thu thập, làm sạch, chuẩn hóa và lưu dữ liệu vào CSDL:

```bash
npm run pipeline
```

---

### Bước 5: Khởi Chạy Web Dashboard UI

Để khởi chạy Web Server và giao diện Bảng điều khiển, chạy lệnh:

```bash
npm start
```

Dashboard sẽ tự động hoạt động trên trình duyệt tại địa chỉ: **http://localhost:3000**.
