# CloneQL Project Handoff

File này dùng để mở cuộc trò chuyện mới với Codex/AI khác mà vẫn hiểu đầy đủ dự án.

## Tổng Quan

CloneQL là web học từ vựng cá nhân, lấy cảm hứng từ trải nghiệm học của Quizlet nhưng dùng UI/logic riêng.

Mục tiêu chính:

- Học từ vựng hiệu quả, ít nản.
- Dùng được trên máy tính và điện thoại.
- Có flashcard, học tập trung, kiểm tra, game, import/export.
- Không cần đăng nhập vì chỉ dùng cá nhân.

## Tech Stack

Monorepo:

```txt
E:\CloneQL
  backend/
  frontend/
  package.json
```

Backend:

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Zod
- dotenv

Frontend:

- React
- Vite
- TailwindCSS
- React Router
- Axios
- Lucide React
- Web Speech API cho phát âm
- Web Audio API cho hiệu ứng âm thanh

Deploy:

- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas

## URLs Deploy

Frontend Vercel, dùng để mở web:

```txt
https://h-c-t-v-ng-ta-frontend.vercel.app
```

Backend Render, chỉ là API:

```txt
https://cloneql-backend.onrender.com
```

API base URL:

```txt
https://cloneql-backend.onrender.com/api
```

Health check:

```txt
https://cloneql-backend.onrender.com/api/health
```

## Environment Variables

Backend local file:

```txt
backend/.env
```

Backend local:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://...
```

Backend Render:

```env
PORT=10000
CLIENT_URL=https://h-c-t-v-ng-ta-frontend.vercel.app
MONGODB_URI=mongodb+srv://...
```

Frontend Vercel:

```env
VITE_API_URL=https://cloneql-backend.onrender.com/api
```

Frontend local không bắt buộc cần `.env`; nếu thiếu `VITE_API_URL`, code fallback về:

```txt
http://localhost:4000/api
```

File liên quan:

```txt
frontend/src/services/api.js
```

Trong đó có:

```js
baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api"
```

## Lệnh Chạy

Cài dependencies:

```bash
npm install
```

Seed dữ liệu mẫu:

```bash
npm run seed --workspace backend
```

Chạy cả backend và frontend:

```bash
npm run dev
```

Chạy riêng:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Build frontend:

```bash
npm run build
```

Backend production start:

```bash
npm start --workspace backend
```

## Cấu Trúc Backend

Backend modular:

```txt
backend/src/
  app.js
  server.js
  seed.js
  config/
    env.js
    database.js
  middlewares/
    error.middleware.js
  utils/
    ApiError.js
    asyncHandler.js
  modules/
    sets/
    cards/
    dictionary/
    study/
    tests/
    games/
```

Các module chính:

- `sets`: CRUD bộ từ, export CSV/JSON.
- `cards`: thêm/sửa/xóa thẻ, bulk import.
- `dictionary`: gợi ý nghĩa tiếng Việt.
- `study`: session học, progress, spaced repetition, summary dashboard.
- `tests`: sinh bài kiểm tra.
- `games`: lưu điểm game.

## API Quan Trọng

Health:

```txt
GET /api/health
```

Sets:

```txt
GET    /api/sets
POST   /api/sets
GET    /api/sets/:id
PATCH  /api/sets/:id
DELETE /api/sets/:id
GET    /api/sets/:id/export.csv
GET    /api/sets/:id/export.json
```

Cards:

```txt
POST   /api/cards
POST   /api/cards/bulk
PATCH  /api/cards/:id
DELETE /api/cards/:id
```

Dictionary:

```txt
GET /api/dictionary/suggest?term=hello&from=en-US&to=vi-VN
```

Study:

```txt
GET  /api/study/:setId/session
GET  /api/study/:setId/summary
POST /api/study/answer
```

Tests:

```txt
GET /api/tests/:setId
```

Games:

```txt
GET  /api/games/scores
POST /api/games/scores
```

## Tính Năng Đã Có

Quản lý bộ từ:

- Tạo bộ từ.
- Xem danh sách bộ từ.
- Xem chi tiết bộ từ.

Quản lý thẻ:

- Thêm từng thẻ.
- Sửa thẻ.
- Xóa thẻ.
- Tìm kiếm thẻ.
- Phát âm từng thẻ.
- Hiển thị nghĩa tiếng Việt có dấu cho một số dữ liệu cũ.

Import/export:

- Import hàng loạt bằng paste CSV/tab.
- Preview dòng import.
- Tự bỏ header `term,definition`.
- Export CSV để import lại.
- Export JSON để backup đầy đủ.

Gợi ý nghĩa:

- Khi nhập từ tiếng Anh, backend gợi ý nghĩa tiếng Việt.
- Có từ điển nội bộ với tiếng Việt có dấu.
- Nếu không có trong nội bộ, backend gọi MyMemory API.
- Kết quả được cache vào MongoDB Atlas.

Phát âm:

- Dùng Web Speech API.
- Nút loa thủ công luôn phát âm.
- Setting “Tự phát âm” chỉ ảnh hưởng auto-read trong Learn mode.

Dashboard:

- Đã học.
- Cần ôn hôm nay.
- Đã thuộc.
- Streak.
- Daily Quest: mục tiêu 12 thẻ/ngày.
- XP hôm nay.
- Kỷ lục Match.
- Kỷ lục Blast.
- Từ cần chú ý.

Mode học:

- Thẻ ghi nhớ.
- Học tập trung.
- Kiểm tra.
- Ghép thẻ.
- Blast.
- Khối hộp.

Learn mode:

- Câu hỏi trắc nghiệm 4 đáp án.
- Progress bar.
- XP/combo.
- Phím tắt: `1-4`, `Space`, `Enter`.
- Tự ưu tiên từ khó/từ cần ôn.
- Ghi progress vào MongoDB.
- Ghi daily quest localStorage.

Flashcard:

- Flip card.
- Đã thuộc/chưa thuộc.
- Progress.
- Phím tắt: `Space`, `A`, `K`, `S`, arrow left/right.
- Mobile responsive.

Test:

- Màn bắt đầu.
- Timer.
- Câu viết, trắc nghiệm, đúng/sai.
- Chấm điểm.
- Hiện đáp án đúng khi sai.

Match:

- Timer.
- Điểm.
- Số lỗi.
- Màn hoàn thành.
- Lưu best time localStorage.
- Cộng XP.

Blast:

- Game 60 giây.
- 3 mạng.
- Combo.
- Điểm.
- Game over.
- Lưu high score localStorage.
- Cộng XP.

Responsive/mobile:

- Header mobile gọn.
- Dashboard mobile-first.
- Mode grid 2 cột trên điện thoại.
- Card manager chuyển thành card list trên mobile.
- Flashcard/Learn mobile-friendly.

## LocalStorage Keys

File:

```txt
frontend/src/utils/habits.js
frontend/src/utils/audio.js
```

Keys:

```txt
cloneql.habits.v1
cloneql.soundEnabled
cloneql.speechEnabled
```

## Những Lỗi Đã Gặp Và Cách Sửa

### Trang trắng local

Nguyên nhân:

- Thiếu `frontend/vite.config.js`.

Đã sửa bằng:

```txt
frontend/vite.config.js
```

Nội dung dùng `@vitejs/plugin-react`.

### Render backend deploy fail

Log:

```txt
Could not connect to any servers in your MongoDB Atlas cluster...
Make sure your current IP address is on your Atlas cluster's IP whitelist
```

Nguyên nhân:

- MongoDB Atlas chặn IP Render.

Cách sửa:

- MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere.
- Thêm `0.0.0.0/0`.

### Loa không phát âm

Nguyên nhân:

- `speak()` từng bị chặn bởi setting `isSpeechEnabled`.
- Khi tắt tự phát âm thì bấm loa thủ công cũng bị tắt.

Đã sửa:

- `speak(text, lang, { auto: true })` chỉ chặn khi auto.
- Loa thủ công gọi `speak(text, lang)` nên luôn phát.

File:

```txt
frontend/src/utils/audio.js
frontend/src/components/modes/LearnMode.jsx
```

### Vercel config

Vercel chỉ deploy frontend:

```txt
Root Directory: frontend
Application Preset: Vite
Build Command: npm run build
Output Directory: dist
Environment: VITE_API_URL=https://cloneql-backend.onrender.com/api
```

Backend không deploy trên Vercel vì backend Express đã chạy ở Render.

## Những File Quan Trọng

Frontend:

```txt
frontend/src/services/api.js
frontend/src/utils/audio.js
frontend/src/utils/habits.js
frontend/src/utils/vietnamese.js
frontend/src/pages/Home.jsx
frontend/src/pages/SetDetail.jsx
frontend/src/components/SetDashboard.jsx
frontend/src/components/CardEditor.jsx
frontend/src/components/BulkImport.jsx
frontend/src/components/CardManager.jsx
frontend/src/components/ExportMenu.jsx
frontend/src/components/modes/FlashcardMode.jsx
frontend/src/components/modes/LearnMode.jsx
frontend/src/components/modes/TestMode.jsx
frontend/src/components/modes/MatchMode.jsx
frontend/src/components/modes/BlastMode.jsx
```

Backend:

```txt
backend/src/app.js
backend/src/server.js
backend/src/config/env.js
backend/src/config/database.js
backend/src/modules/sets/
backend/src/modules/cards/
backend/src/modules/dictionary/
backend/src/modules/study/
backend/src/modules/tests/
backend/src/modules/games/
```

## Việc Nên Làm Tiếp

Ưu tiên cao:

1. Test kỹ web trên điện thoại thật sau khi deploy.
2. Nếu frontend không load data, kiểm tra:
   - `VITE_API_URL` trên Vercel.
   - `CLIENT_URL` trên Render.
   - CORS trong `backend/src/app.js`.
3. Nếu còn chữ lỗi encoding, sửa trực tiếp file JSX tương ứng bằng UTF-8.
4. Thêm PWA để cài web như app trên điện thoại.

Ưu tiên vừa:

1. Auto-fill thông minh hơn:
   - Phiên âm IPA.
   - Ví dụ tiếng Anh.
   - Loại từ.
2. Nâng `Khối hộp`.
3. Lưu best score game vào MongoDB thay vì chỉ localStorage.
4. Export toàn bộ tất cả bộ từ, không chỉ từng bộ.

Ưu tiên sau:

1. Custom domain.
2. Tối ưu Render sleep hoặc chuyển backend sang dịch vụ không sleep.
3. Thêm test tự động.

## Deploy Checklist

Backend Render:

- Status phải là Live.
- Logs phải có:

```txt
MongoDB connected
API listening on http://localhost:10000
```

Frontend Vercel:

- Status Ready.
- Env:

```env
VITE_API_URL=https://cloneql-backend.onrender.com/api
```

Render backend env:

```env
CLIENT_URL=https://h-c-t-v-ng-ta-frontend.vercel.app
MONGODB_URI=mongodb+srv://...
PORT=10000
```

Final test:

1. Mở frontend Vercel.
2. Load bộ từ.
3. Thêm từ `hello`, xem gợi ý.
4. Bấm loa.
5. Học mode Learn.
6. Import hàng loạt.
7. Export CSV.

## Ghi Chú

- Render free có thể sleep. Lần mở web đầu tiên sau thời gian không dùng có thể chậm 30-60 giây.
- MongoDB Atlas đang cho phép `0.0.0.0/0` để Render kết nối được.
- Web dùng cho cá nhân nên chưa có auth/user.
