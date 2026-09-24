# Website tĩnh 5 trang (dạng tab)

Không cần cài đặt, không cần server, không cần build — chỉ là các file
HTML/CSS thuần. Sửa trực tiếp trên GitHub là web đã thay đổi (sau khi GitHub
Pages build lại, thường mất khoảng 30–60 giây).

## Cấu trúc file

```
index.html        → Trang chủ (tab đầu tiên)
gioi-thieu.html    → Giới thiệu
dich-vu.html        → Dịch vụ
bang-gia.html       → Bảng giá
lien-he.html         → Liên hệ
style.css           → Style dùng chung cho cả 5 trang (thanh tab, màu sắc, layout)
```

## Cách sửa nội dung

Mở file `.html` tương ứng ngay trên GitHub (bấm biểu tượng bút chì để sửa),
tìm phần trong thẻ `<main class="wrap content">...</main>` — đó là nội dung
của trang. Sửa xong bấm "Commit changes".

Ví dụ trong `lien-he.html`:

```html
<main class="wrap content">
  <h1>Liên hệ</h1>
  <p>Email: contact@vidu.com<br>Điện thoại: 0900 000 000</p>
</main>
```

Bạn có thể gõ HTML tự do trong đây: thêm đoạn văn `<p>`, danh sách `<ul><li>`,
ảnh `<img src="...">`, link `<a href="...">`, v.v.

## Cách thêm một tab/trang mới

1. Copy một file `.html` bất kỳ, đổi tên (ví dụ `tin-tuc.html`).
2. Sửa `<title>` và nội dung trong `<main>`.
3. Mở **cả 5 file hiện có** (kể cả file mới), thêm một dòng vào phần
   `<nav class="tabs">` để trỏ tới trang mới:
   ```html
   <a href="tin-tuc.html">Tin tức</a>
   ```
   (nếu đang ở chính trang đó thì thêm `class="active"` vào thẻ `<a>`, xem ví
   dụ trong `index.html`.)

## Bật GitHub Pages (nếu repo chưa bật)

1. Vào repo trên GitHub → **Settings** → **Pages**.
2. Ở mục **Build and deployment** → **Source**, chọn **Deploy from a branch**.
3. Chọn branch `main` (hoặc branch bạn đang dùng), thư mục chọn `/ (root)`
   — vì các file HTML này nằm ngay ở thư mục gốc của repo, không nằm trong
   thư mục `docs/` hay đâu khác.
4. Lưu lại. GitHub sẽ cấp một URL dạng
   `https://<tên-tài-khoản>.github.io/<tên-repo>/` — nếu tên repo là
   `<tên-tài-khoản>.github.io` thì URL sẽ gọn hơn:
   `https://<tên-tài-khoản>.github.io/`.
5. Trang chủ sẽ là `index.html`, tự mở khi vào URL gốc.

## Lưu ý

Đây là site hoàn toàn tĩnh — không có đăng nhập, không có chỗ lưu dữ liệu
động (không có form gửi liên hệ hoạt động thật, không có database). Việc
"quản trị" nội dung chính là sửa file trên GitHub. Nếu sau này bạn cần form
liên hệ hoạt động thật, đặt lịch, hay nội dung động cần lưu trữ, sẽ cần quay
lại hướng có server (như bản Node.js trước đó) hoặc dùng dịch vụ form bên
thứ ba (Formspree, Google Form nhúng, ...).
