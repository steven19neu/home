# Simple CMS — website 5 trang + trang quản trị

Website tĩnh 5 trang, nội dung mỗi trang là HTML lưu trong `data/pages.json`.
Có trang `/admin` để đăng nhập và sửa HTML từng trang.

## 1. Cài đặt

```bash
npm install
cp .env.example .env
```

## 2. Tạo mật khẩu admin

```bash
npm run hash-password -- "mat-khau-cua-ban"
```

Lệnh trên in ra một chuỗi hash (dạng `$2a$12$...`). Dán chuỗi đó vào biến
`ADMIN_PASSWORD_HASH` trong file `.env`.

Mở `.env` và chỉnh:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<dán hash vừa tạo>
SESSION_SECRET=<một chuỗi ngẫu nhiên dài ít nhất 32 ký tự>
```

Gợi ý tạo `SESSION_SECRET` ngẫu nhiên:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Chạy thử ở máy local

```bash
npm start
```

Mở `http://localhost:3000` để xem trang chủ, và `http://localhost:3000/admin` để đăng nhập quản trị.

## 4. Cấu trúc 5 trang

Danh sách trang nằm trong `data/pages.json`. Mặc định gồm:
`home`, `gioi-thieu`, `dich-vu`, `bang-gia`, `lien-he`. Bạn có thể đổi tiêu đề,
nội dung HTML (`content`), thứ tự (`order`) trực tiếp trong file này, hoặc
sửa qua giao diện `/admin` sau khi đăng nhập. Trang có `slug: "home"` luôn là
trang chủ (`/`); các trang khác chạy ở đường dẫn `/<slug>`.

Muốn thêm trang thứ 6, thêm 7... chỉ cần thêm một object mới vào mảng trong
`data/pages.json` theo đúng cấu trúc các trang hiện có.

## 5. Triển khai lên server riêng

Ứng dụng là một app Node/Express thuần, chạy được trên bất kỳ VPS, hoặc các
nền tảng như Render, Railway, Fly.io, DigitalOcean App Platform...

Các bước chung:

1. Đẩy code lên server (git clone hoặc upload), **không đẩy file `.env`**.
2. Trên server: `npm install --production`, tạo file `.env` riêng với
   `ADMIN_PASSWORD_HASH` và `SESSION_SECRET` thật.
3. Đặt `TRUST_PROXY_HTTPS=true` trong `.env` nếu server chạy sau reverse
   proxy có HTTPS (Nginx, Caddy, Cloudflare...) — giúp cookie đăng nhập chỉ
   gửi qua HTTPS.
4. Chạy app bằng một process manager để tự khởi động lại khi crash hoặc
   reboot, ví dụ `pm2`:
   ```bash
   npm install -g pm2
   pm2 start server.js --name simple-cms
   pm2 save
   ```
5. Đặt Nginx/Caddy làm reverse proxy trỏ về cổng app (`PORT` trong `.env`,
   mặc định 3000) và cấp HTTPS (ví dụ Let's Encrypt).

## 6. Lưu ý bảo mật

- Chỉ đưa mật khẩu admin cho người bạn tin tưởng: nội dung admin nhập vào ô
  "Nội dung HTML" được hiển thị **nguyên văn**, không lọc — tức là admin có
  toàn quyền chèn cả thẻ `<script>`. Đây là chủ đích (để sửa HTML tự do),
  nhưng đồng nghĩa tài khoản admin phải được bảo vệ cẩn thận.
- Bắt buộc chạy sau HTTPS khi triển khai thật, để mật khẩu và cookie phiên
  đăng nhập không bị lộ trên đường truyền.
- File `data/pages.json` là nơi lưu toàn bộ nội dung — nên có cơ chế backup
  định kỳ (ví dụ cron copy sang nơi khác) nếu nội dung quan trọng.
- Giới hạn đăng nhập sai hiện dùng bộ đếm trong RAM (mất khi restart app) —
  đủ dùng cho quy mô nhỏ; nếu cần chặt hơn, cân nhắc thêm captcha hoặc
  chuyển sang giới hạn theo Redis khi có nhiều traffic.
