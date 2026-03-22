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

## Phase 2: Quản lý Sự kiện (Admin) — PENDING
## Phase 3: Kiểm duyệt (Admin) — PENDING
## Phase 4: Quản lý Danh mục (Admin) — PENDING
## Phase 5: Quản lý Hình ảnh (dùng chung) — PENDING
## Phase 6: Trang Contributor — PENDING
## Phase 7: Tách components dùng chung — PENDING
