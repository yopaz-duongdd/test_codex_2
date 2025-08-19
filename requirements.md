Cuộc thi: WEB1 AI Innovation Hackathon
Đề bài: Xây dựng hệ thống quản lý & thực thi kịch bản Chrome Recorder để tự động test sản phẩm

Bối cảnh
Tester thường phải test đi test lại nhiều chức năng/màn hình, tốn thời gian và dễ sai sót.
Giờ đây, nếu một tính năng đã được kiểm thử ổn định, tester sẽ record lại kịch bản test bằng Chrome Recorder (xuất ra file Puppeteer .js).
Từ giờ, chỉ cần import lại kịch bản này vào hệ thống để chạy tự động, thu thập kết quả và giảm effort regression test.

Tính năng Recorder trong Google Chrome DevTools là một công cụ cho phép bạn ghi lại và phát lại các thao tác trên trình duyệt.
Ghi thao tác (Record): Lưu lại các hành động như click, nhập liệu, điều hướng… mà bạn thực hiện trên một trang web.


Phát lại (Replay): Chạy lại các thao tác đã ghi để tái hiện quá trình tương tác với trang.


Xuất kịch bản: Có thể export thành mã JavaScript (Puppeteer hoặc Playwright) để chạy tự động bằng code, phục vụ automation test.


Phân tích hiệu suất: Khi phát lại, có thể đo thời gian tải, kiểm tra lỗi console, và đánh giá hành vi của trang web.


Tóm lại, Chrome Recorder giúp QA/Testers nhanh chóng tạo kịch bản test tự động mà không cần viết code từ đầu.

Yêu cầu chức năng
1. Web Admin (Next.js hoặc framework tuỳ chọn) – 8 điểm
   Xác thực bằng API key:


Ở góc trên bên phải hiển thị API key (lưu trong DB).
Chỉ ai nhập đúng API key mới truy cập được.


Quản lý Dự án: Thêm, sửa, xoá (Tên, mô tả).


Quản lý Màn hình: Thêm, sửa, xoá (Tên, domain, url path, dự án, mô tả).


Quản lý Kịch bản test:


Thêm, sửa, xoá kịch bản (file .js Chrome Recorder, tên, dự án, màn hình, tag, version).
Auto-increment version nếu để trống.
Search theo: dự án, tag, màn hình.


Quản lý Tag:
Mỗi dự án có nhiều tag, không trùng tag trong cùng dự án.
Toàn hệ thống có thể trùng tag giữa các dự án khác nhau.


Kết quả test:


Xem danh sách, xem chi tiết, xoá kết quả test.
Search theo: tên kịch bản, dự án, màn hình, tag, version.



2. App PC (Electron hoặc tuỳ chọn) – 6 điểm
   Xác thực bằng API key:


Nhập API key để sử dụng app.


Chọn & chạy kịch bản:


Chọn dự án, màn hình, kịch bản, version.
Có nút “Chạy tất cả kịch bản đã filter” (chạy tuần tự, không song song).
Khi chạy sẽ mở cửa sổ Chrome (Puppeteer) để chạy file .js.


Thu thập dữ liệu khi chạy (mỗi step):


URL page hiện tại
Console log error
Ảnh chụp màn hình cuối mỗi step (toàn màn hình)


Gửi dữ liệu về API để lưu kết quả.



3. API Backend (Laravel hoặc framework tuỳ chọn, hoặc không cần cũng không sao) – 3 điểm
   Phục vụ được cho WEB app và admin là được
   Nếu không có api điểm sẽ được cộng cho Web Admin

Lưu ý & Giới hạn
Không có chức năng login bằng email/password, quên mật khẩu, tạo account.


Không có chạy nhiều luồng song song.


Có thể gộp Web Admin & API chung 1 ứng dụng backend.


App PC chỉ cần chạy được trên 1 hệ điều hành (Windows/macOS/Linux tuỳ chọn).


Chấm trên thang điểm 20, gồm:


Web admin: 8 điểm


App PC: 6 điểm


API: 3 điểm


Giao diện & UX: 3 điểm


Các tìm kiếm không ghi rõ thì mặc định là search theo kiểu LIKE.
