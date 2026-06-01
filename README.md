# Simple Blog React Frontend

Front-end React 19 + Vite tương ứng với Spring Boot Simple Blog API của bạn.

## Chức năng đã làm

### Public
- Xem danh sách blog đã publish
- Tìm kiếm blog theo từ khóa
- Lọc theo category và tag
- Xem chi tiết blog theo slug

### Auth
- Đăng ký
- Đăng nhập bằng JWT
- Xem thông tin tài khoản hiện tại
- Lưu token vào localStorage

### User
- Xem danh sách blog của tôi
- Tạo blog mới
- Sửa blog
- Xóa blog
- Comment vào blog
- Xóa comment của chính mình

### Admin
- Tạo category
- Tạo tag
- Xem danh sách user
- Đổi role user
- Publish blog theo blog ID
- Ẩn comment trên các blog đã publish

## Công nghệ
- React 19
- Vite
- React Router DOM
- Axios
- CSS thuần

## Chạy project

### 1. Cài package
```bash
npm install
```

### 2. Chạy dev server
```bash
npm run dev
```

Mặc định app chạy ở:
- Frontend: `http://localhost:5173`
- Backend Spring Boot: `http://localhost:8080`

## Quan trọng về CORS
Backend Spring Boot của bạn hiện **chưa cấu hình CORS**.

Vì vậy project này dùng Vite proxy:
- React gọi API qua `/api/...`
- Vite tự chuyển tiếp sang `http://localhost:8080/...`

Nghĩa là khi chạy local bằng `npm run dev` thì không cần sửa backend.

Nếu bạn deploy frontend và backend tách domain/port, bạn cần bật CORS trong Spring Boot.

## API base URL
Trong dev mode, cứ để trống `VITE_API_BASE_URL` để app dùng `/api`.

Nếu muốn gọi trực tiếp API đã deploy, tạo file `.env`:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

Lưu ý: khi dùng domain khác, backend phải cho phép CORS.

## Tài khoản demo backend
Theo README backend của bạn:
- `admin / 123456`
- `user1 / 123456`

## Ghi chú về giới hạn từ backend hiện tại
Do API hiện tại **chưa có endpoint list toàn bộ blog draft cho admin**, nên phần publish blog của admin được làm theo cách:
- nhập trực tiếp `blogId` để publish
- hoặc lấy `blogId` từ danh sách blog của người dùng sở hữu bài viết

Tương tự, backend chưa có endpoint list toàn bộ comment ẩn. Frontend hiện hỗ trợ admin ẩn các comment đang hiển thị trên bài viết đã publish.

## Cấu trúc thư mục
```text
src/
  components/
  contexts/
  lib/
  pages/
```

## Build production
```bash
npm run build
```

## Sửa lỗi cài đặt trên Windows
Bản này đã bỏ hoàn toàn package Linux-only khỏi `devDependencies` và **không kèm `node_modules` / `package-lock.json`** trong file zip.

Lý do: file khóa sinh trên Linux có thể làm npm trên Windows cố cài package sai nền tảng, gây lỗi `EBADPLATFORM`.

Nếu bạn từng giải nén bản cũ, hãy xóa các thư mục/file sau trước khi cài lại:
```bash
node_modules
package-lock.json
```
Sau đó chạy lại:
```bash
npm install
npm run dev
```

## Yêu cầu Node.js
Khuyên dùng **Node.js 18+**.
