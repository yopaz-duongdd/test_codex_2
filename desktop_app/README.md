# Chrome Recorder Manager - Desktop App

Ứng dụng desktop được xây dựng bằng Electron để quản lý và thực thi các kịch bản test Chrome Recorder.

## Tính năng chính

### 1. Xác thực API Key
- Đăng nhập bằng API Key từ hệ thống Web Admin
- Cấu hình API URL linh hoạt
- Lưu trữ thông tin đăng nhập an toàn

### 2. Quản lý kịch bản test
- Xem danh sách kịch bản từ server
- Lọc theo dự án, màn hình, tag
- Tìm kiếm theo tên kịch bản
- Hiển thị thông tin chi tiết từng kịch bản

### 3. Thực thi test
- Chạy kịch bản đơn lẻ
- Chạy tất cả kịch bản đã lọc (tuần tự)
- Theo dõi tiến trình thực thi real-time
- Dừng test đang chạy

### 4. Thu thập dữ liệu
- Chụp screenshot sau mỗi step
- Thu thập console errors
- Ghi lại URL hiện tại
- Lưu thông tin chi tiết từng step

### 5. Gửi kết quả về API
- Tự động gửi kết quả test về server
- Lưu trữ screenshots và logs
- Đồng bộ dữ liệu với Web Admin

## Cấu trúc thư mục

```
desktop_app/
├── src/
│   ├── main/                 # Main process (Electron)
│   │   ├── main.js          # Entry point
│   │   ├── preload.js       # Preload script
│   │   └── testExecutor.js  # Test execution logic
│   └── renderer/            # Renderer process (React)
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── services/    # API services
│       │   └── App.js       # Main app component
│       ├── package.json
│       └── tailwind.config.js
├── screenshots/             # Generated screenshots
├── package.json
└── README.md
```

## Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
# Cài đặt dependencies cho main process
cd desktop_app
npm install

# Cài đặt dependencies cho renderer process
cd src/renderer
npm install
```

### 2. Chạy ứng dụng

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 3. Build distribution

```bash
# Build cho Windows
npm run dist

# Build cho tất cả platforms
npm run dist -- --win --mac --linux
```

## Cấu hình

### API Configuration
- **API URL**: Địa chỉ server backend (mặc định: http://localhost:3001)
- **API Key**: Key xác thực từ Web Admin

### Test Execution
- **Browser**: Sử dụng Puppeteer để điều khiển Chrome
- **Screenshots**: Lưu trong thư mục `screenshots/`
- **Logs**: Sử dụng electron-log để ghi log

## Tích hợp với Backend

Ứng dụng kết nối với API server để:
- Xác thực API key
- Lấy danh sách projects, screens, scripts, tags
- Gửi kết quả test về server
- Đồng bộ dữ liệu

## Yêu cầu hệ thống

- **Node.js**: >= 16.0.0
- **Chrome/Chromium**: Được cài đặt trên hệ thống
- **RAM**: >= 4GB (khuyến nghị 8GB)
- **Disk**: >= 1GB trống cho screenshots

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra API URL và API Key
- Đảm bảo server backend đang chạy
- Kiểm tra firewall/network settings

### Lỗi Puppeteer
- Đảm bảo Chrome được cài đặt
- Kiểm tra quyền truy cập file system
- Tăng timeout nếu cần thiết

### Lỗi screenshot
- Kiểm tra quyền ghi file
- Đảm bảo có đủ dung lượng disk
- Kiểm tra thư mục screenshots tồn tại

## Phát triển

### Thêm tính năng mới
1. Thêm IPC handlers trong `main.js`
2. Cập nhật preload script
3. Tạo/cập nhật React components
4. Cập nhật API service nếu cần

### Testing
```bash
# Test renderer
cd src/renderer
npm test

# Test main process
npm test
```

### Debugging
- Sử dụng Chrome DevTools cho renderer process
- Sử dụng VS Code debugger cho main process
- Kiểm tra logs trong console và file logs