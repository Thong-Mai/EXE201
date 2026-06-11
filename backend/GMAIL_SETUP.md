# Hướng dẫn Cấu hình Gmail App Password cho Nodemailer

Để ứng dụng Backend có thể gửi email qua SMTP của Gmail, bạn không thể sử dụng mật khẩu Gmail thông thường vì lý do bảo mật. Thay vào đó, bạn phải tạo một **Mật khẩu ứng dụng (App Password)**.

Dưới đây là các bước chi tiết để cấu hình:

## Bước 1: Bật Xác minh 2 bước (2-Step Verification)
1. Đăng nhập vào Tài khoản Google của bạn tại: [Tài khoản Google của tôi](https://myaccount.google.com/).
2. Chọn tab **Bảo mật (Security)** ở cột menu bên trái.
3. Cuộn xuống phần **Cách bạn đăng nhập vào Google (How you sign in to Google)**.
4. Đảm bảo rằng **Xác minh 2 bước (2-Step Verification)** đã được **Bật (ON)**. Nếu chưa bật, hãy nhấp vào đó và làm theo các bước hướng dẫn để thiết lập.

## Bước 2: Tạo Mật khẩu ứng dụng (App Password)
1. Sau khi đã bật Xác minh 2 bước, nhấp vào mũi tên bên phải của phần **Xác minh 2 bước (2-Step Verification)**.
2. Cuộn xuống dưới cùng của trang và nhấp vào mục **Mật khẩu ứng dụng (App Passwords)**.
3. Trong ô **Tên ứng dụng (App name)**, điền một tên gợi nhớ bất kỳ (Ví dụ: `SAVE+ Backend` hoặc `Nodemailer OTP`).
4. Nhấp vào nút **Tạo (Create)**.
5. Một cửa sổ popup sẽ hiện lên hiển thị một chuỗi ký tự ngẫu nhiên gồm 16 chữ số (ví dụ: `abcd efgh ijkl mnop`). **Hãy sao chép chuỗi mã này** (không cần sao chép các ký tự khoảng trắng).
6. Nhấp vào **Xong (Done)**.

> [!WARNING]
> Google chỉ hiển thị chuỗi mật khẩu này **DUY NHẤT MỘT LẦN**. Hãy lưu giữ cẩn thận hoặc sao chép để dán ngay vào cấu hình môi trường.

## Bước 3: Cấu hình biến môi trường `.env`
Mở file `.env` ở thư mục `backend` và điền thông tin tài khoản của bạn:

```env
# Gmail SMTP
GMAIL_USER=tài_khoản_gmail_của_bạn@gmail.com
GMAIL_APP_PASSWORD=mã_16_ký_tự_vừa_tạo
```

*Lưu ý: Mật khẩu ứng dụng của bạn phải được viết liền nhau không chứa dấu cách (Ví dụ: `abcdefghijklmnop`).*

## Bước 4: Khởi động lại Backend Server
Sau khi lưu file `.env`, hãy khởi động lại server backend:
```bash
npm run dev
```
Hệ thống sẽ tải cấu hình mới và bắt đầu gửi OTP thông qua tài khoản Gmail của bạn!
