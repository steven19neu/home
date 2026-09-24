# Static website (English) — Home / About / Contact / QR Generator

Không cần cài đặt, không build, không server. Sửa file `.html` trực tiếp
trên GitHub là web thay đổi (GitHub Pages build lại sau ~30–60 giây).

## Cấu trúc

```
index.html         → Home
about.html          → About
contact.html        → Contact
qr-generator.html   → QR Code Generator (công cụ tạo QR đen trắng, chạy hoàn toàn trên trình duyệt)
style.css           → Style dùng chung cho cả site + cho công cụ QR
```

Đã bỏ `pricing.html` và `services.html` theo yêu cầu.

## Trang QR Generator

Y hệt công cụ đã làm trước đó, nay được nhúng thành một tab trong site,
dùng chung màu sắc/kiểu chữ với các trang còn lại thay vì giao diện đen
trắng riêng. Chạy hoàn toàn bằng JavaScript phía trình duyệt (thư viện
`qrcodejs` tải qua CDN), không cần backend hay lưu trữ gì thêm.

## Ẩn/thêm/xoá trang

Xem lại hướng dẫn ở các bản trước — cách làm không đổi:
- Xoá dòng `<a href="...">` trong khối `<nav class="tabs">` ở mọi file để
  ẩn khỏi menu (file vẫn còn nếu ai có link).
- Xoá hẳn file `.html` để gỡ trang hoàn toàn.
- Muốn khoá bằng mật khẩu thật, site tĩnh không làm được an toàn — cần
  Netlify/Cloudflare Pages (tính năng password protection) hoặc quay lại
  bản có server (Node.js) với đăng nhập thật.
