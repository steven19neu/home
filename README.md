# Steven19's Tools — static site (2 pages)

Không cần cài đặt, không build, không server. Sửa file `.html` trực tiếp
trên GitHub là web thay đổi (GitHub Pages build lại sau ~30–60 giây).

## Cấu trúc

```
index.html   → QR Generator (trang chủ)
about.html   → About
style.css    → Style dùng chung cho cả site + công cụ QR
```

Đã đổi tên hiển thị toàn site thành **Steven19's Tools** (ở logo góc trái,
tiêu đề tab trình duyệt, và footer). Đã đặt QR Generator làm trang chủ
(`index.html`), chỉ còn lại About bên cạnh — Home/Contact/Pricing/Services
đã bị xoá theo yêu cầu.

## Ẩn/thêm/xoá trang

Cách làm không đổi so với các bản trước:
- Xoá dòng `<a href="...">` trong khối `<nav class="tabs">` ở cả 2 file để
  ẩn khỏi menu (file vẫn còn nếu ai có link).
- Xoá hẳn file `.html` để gỡ trang hoàn toàn.
- Muốn thêm trang mới, copy `about.html`, đổi tên + nội dung, rồi thêm dòng
  link vào `<nav class="tabs">` ở **cả hai** file hiện có.
