# Tiến độ triển khai Admin & Contributor FE

## Phase 1: Quản lý Địa điểm (Admin) — DONE

**Files tạo mới:**
- `src/services/AdminPlaceService.ts` — Service gọi API places (getAll, getById, create, update, delete)
- `src/store/slice/AdminPlaceSlice.ts` — Redux slice với 5 thunks (fetch, fetchById, create, update, delete)

**Files cập nhật:**
- `src/store/index.ts` — Đăng ký `adminPlaces` reducer
- `src/page/AdminPage.tsx` — Thêm tab "Quản lý Địa điểm":
  - Bảng danh sách: Ảnh, Tên, Địa chỉ, Danh mục, Trạng thái duyệt, Đánh giá, Thao tác
  - Nút [+ Thêm địa điểm] mở form modal
  - Form modal thêm/sửa với các trường: title, description, address, adminUnitId, lat/lng, categories (multi-select), tags
  - Nút Sửa (icon), Xóa (icon + confirm), Xem chi tiết (link tab mới)
  - Phân trang
  - Badge trạng thái duyệt (Chờ duyệt/Đã duyệt/Từ chối)
  - Click card Tổng quan → điều hướng sang tab tương ứng
  - Sidebar cấu hình dynamic (dễ thêm tab mới)
  - Refactor: tách badge thành component riêng, cải thiện code structure

---

## Phase 2: Quản lý Sự kiện (Admin) — DONE

**Files tạo mới:**
- `src/services/AdminEventService.ts` — Service gọi API events (getAll, getById, create, update, delete)
- `src/store/slice/AdminEventSlice.ts` — Redux slice với 4 thunks (fetch, create, update, delete)

**Files cập nhật:**
- `src/store/index.ts` — Đăng ký `adminEvents` reducer
- `src/page/AdminPage.tsx` — Thêm tab "Quản lý Sự kiện":
  - Bảng 8 cột: Ảnh, Tên, Địa điểm, Thời gian (start→end), Trạng thái SK, Kiểm duyệt, Đánh giá, Thao tác
  - EventFormModal: title, description, address, startAt/endAt (datetime-local), eventStatus (select khi sửa), adminUnitId, lat/lng, categories, tags
  - EventStatusBadge: Sắp diễn ra (xanh dương), Đang diễn ra (xanh lá), Đã kết thúc (xám)
  - CRUD đầy đủ + confirm dialog + phân trang
  - Click card "Sự kiện" ở Tổng quan → điều hướng sang tab events

---
## Phase 3: Kiểm duyệt (Admin) — DONE

**Files tạo mới:**
- `src/services/ModerationService.ts` — Service gọi API moderation (approve, reject, getLogs)
- `src/store/slice/ModerationSlice.ts` — Redux slice với 5 thunks (fetchPendingPlaces, fetchPendingEvents, approve, reject, fetchLogs)

**Files cập nhật:**
- `src/store/index.ts` — Đăng ký `moderation` reducer
- `src/page/AdminPage.tsx` — Thêm tab "Kiểm duyệt":
  - Sub-tabs: Địa điểm chờ duyệt (count) / Sự kiện chờ duyệt (count)
  - Bảng pending items: Ảnh, Tên, Địa chỉ, Thời gian (events), Ngày tạo, Thao tác
  - Nút [Duyệt] với input ghi chú (không bắt buộc)
  - Nút [Từ chối] với input lý do (bắt buộc)
  - Nút [Lịch sử] mở modal xem logs kiểm duyệt
  - Link xem chi tiết mở tab mới
  - Sau duyệt/từ chối → tự động xóa khỏi danh sách pending
  - Logs modal: hiển thị timeline hành động duyệt/từ chối với ghi chú, thời gian, người thực hiện

---
## Phase 4: Quản lý Danh mục (Admin) — DONE

**Files tạo mới:**
- `src/services/AdminCategoryService.ts` — Service gọi API categories (getAll, getById, create, update, delete)
- `src/store/slice/AdminCategorySlice.ts` — Redux slice với 4 thunks (fetch, create, update, delete)

**Files cập nhật:**
- `src/store/index.ts` — Đăng ký `adminCategories` reducer
- `src/page/AdminPage.tsx` — Thêm tab "Quản lý Danh mục":
  - Bảng 5 cột: Tên (icon Tag), Slug, Loại (badge), Trạng thái (toggle), Thao tác
  - Form modal nhỏ gọn: name, slug, type (select 5 loại), isActive (toggle chỉ khi sửa)
  - Badge loại: Chủ đề/Phong cách/Hoạt động/Ngân sách/Đối tượng
  - CRUD đầy đủ + confirm dialog + phân trang

---
## Phase 5: Quản lý Hình ảnh (dùng chung) — DONE

**Files tạo mới:**
- `src/services/MediaService.ts` — Service: getSignature, uploadToCloudinary, finalize, getByResource, setPrimary, reorder, delete
- `src/store/slice/MediaSlice.ts` — Redux slice với 4 thunks (fetch, upload 3-step, setPrimary, delete)
- `src/components/MediaManager.tsx` — Component dùng chung cho Place & Event

**Files cập nhật:**
- `src/store/index.ts` — Đăng ký `media` reducer
- `src/page/AdminPage.tsx`:
  - Thêm nút [Ảnh] (icon tím) vào cột Thao tác của bảng Địa điểm và Sự kiện
  - Click mở MediaManager modal
  - MediaManager: upload multi-file, grid ảnh, đặt ảnh chính (★), xóa ảnh, hiển thị kích thước/dung lượng

**Upload flow:** Lấy signature từ BE → Upload trực tiếp lên Cloudinary → Gọi finalize để lưu DB

---
## Phase 6: Trang Contributor — DONE

**Files tạo mới:**
- `src/routes/contributor.tsx` — Route file cho `/contributor`
- `src/page/ContributorPage.tsx` — Trang Contributor đầy đủ, theme emerald

**Files cập nhật:**
- `src/routes/__root.tsx` — Đổi redirect role 1 từ `/administrative-units` sang `/contributor`

**Tính năng:**
- Theme emerald xanh lá, layout sidebar + content giống Admin
- 4 tabs: Tổng quan, Địa điểm, Sự kiện, Kiểm duyệt
- Tổng quan: 4 card thống kê (địa điểm, sự kiện, chờ duyệt địa điểm, chờ duyệt sự kiện) + click điều hướng
- Địa điểm & Sự kiện: CRUD đầy đủ, form modal, phân trang, MediaManager
- Kiểm duyệt: sub-tabs địa điểm/sự kiện, xem trạng thái + lịch sử duyệt (chỉ xem, không duyệt)
- Reuse các Redux slices của Admin (BE tự filter theo scope/role)
- Nút đăng xuất

---
## Phase 7: Tách components dùng chung — PENDING
