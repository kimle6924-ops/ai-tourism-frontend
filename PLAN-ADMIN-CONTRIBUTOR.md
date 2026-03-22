# Kế hoạch hoàn thiện Admin & Contributor Frontend

## Kiến trúc hiện tại

- **Stack**: React 19 + Vite + TanStack Router + Redux Toolkit + Tailwind CSS 4 + Recharts + SweetAlert2 + Lucide icons
- **Pattern**: Service → Slice (createAsyncThunk) → Page component (useSelector/useDispatch)
- **Axios**: `src/utils/headerApi.ts` (interceptor tự refresh token)
- **API Response**: `{ data, success, error, statusCode }`

## Tổng quan Layout

```
┌─────────────────────────────────────────────────┐
│  Header (title + ProfileDropdown)               │
├────────────┬────────────────────────────────────┤
│  Sidebar   │  Main Content                      │
│            │                                    │
│  - Tab 1   │  (thay đổi theo activeTab)         │
│  - Tab 2   │                                    │
│  - Tab 3   │                                    │
│  - ...     │                                    │
│            │                                    │
└────────────┴────────────────────────────────────┘
```

Admin và Contributor dùng chung layout này, khác nhau ở sidebar tabs và nội dung.

---

## PHẦN 1: ADMIN (`/admin`)

### Sidebar tabs mới

```
Tổng quan          (đã có)
Quản lý Người dùng (đã có)
Quản lý Địa điểm   (MỚI)
Quản lý Sự kiện    (MỚI)
Kiểm duyệt         (MỚI)
Quản lý Danh mục   (MỚI)
```

---

### Phase 1: Quản lý Địa điểm (tab `places`)

#### 1.1 Service: `src/services/AdminPlaceService.ts`
```
GET    /api/places/all?PageNumber&PageSize     → getAll(page, size)
GET    /api/places/{id}                        → getById(id)
POST   /api/places                             → create(payload)
PUT    /api/places/{id}                        → update(id, payload)
DELETE /api/places/{id}                        → delete(id)
```

#### 1.2 Slice: `src/store/slice/AdminPlaceSlice.ts`
```typescript
State: {
  places: Place[]
  selectedPlace: Place | null
  totalCount, pageNumber, totalPages
  loading, actionLoading, error
}

Thunks:
  - fetchAdminPlacesThunk({ page, size })
  - createPlaceThunk(payload)
  - updatePlaceThunk({ id, payload })
  - deletePlaceThunk(id)
```

#### 1.3 UI: Tab "Quản lý Địa điểm" trong AdminPage

**Danh sách (mặc định)**
- Bảng: Ảnh | Tên | Địa chỉ | Danh mục | Trạng thái duyệt | Đánh giá TB | Thao tác
- Badge trạng thái: Pending (vàng), Approved (xanh), Rejected (đỏ)
- Nút thao tác: [Sửa] [Xóa] [Xem chi tiết ↗]
  - "Xem chi tiết" → mở tab mới `/places/{id}` (trang user)
- Nút [+ Thêm địa điểm] ở header
- Phân trang

**Form Thêm/Sửa (modal hoặc drawer)**
```
Fields:
  - placeName*          (text)
  - description*        (textarea)
  - address*            (text)
  - latitude, longitude (number) — có nút "Chọn trên bản đồ" nếu muốn
  - categoryId*         (select — load từ GET /api/categories/active)
  - adminUnitId         (select — load từ GET /api/administrative-units)
  - tags                (text, comma separated)
  - openingHours        (text)
  - ticketPrice         (text)
  - website             (text)
  - phoneContact        (text)
```
- Submit → `POST /api/places` hoặc `PUT /api/places/{id}`
- Sau khi tạo thành công → hiện nút "Quản lý hình ảnh" để điều hướng sang upload ảnh

**Liên kết:**
- Click tên địa điểm → mở modal sửa
- Click trạng thái "Pending" → chuyển sang tab Kiểm duyệt (đã filter sẵn)
- Sau tạo/sửa → nút "Quản lý ảnh" mở section upload media

---

### Phase 2: Quản lý Sự kiện (tab `events`)

#### 2.1 Service: `src/services/AdminEventService.ts`
```
GET    /api/events/all?PageNumber&PageSize     → getAll(page, size)
GET    /api/events/{id}                        → getById(id)
POST   /api/events                             → create(payload)
PUT    /api/events/{id}                        → update(id, payload)
DELETE /api/events/{id}                        → delete(id)
```

#### 2.2 Slice: `src/store/slice/AdminEventSlice.ts`
```typescript
State: {
  events: Event[]
  selectedEvent: Event | null
  totalCount, pageNumber, totalPages
  loading, actionLoading, error
}

Thunks:
  - fetchAdminEventsThunk({ page, size })
  - createEventThunk(payload)
  - updateEventThunk({ id, payload })
  - deleteEventThunk(id)
```

#### 2.3 UI: Tab "Quản lý Sự kiện" trong AdminPage

**Danh sách**
- Bảng: Ảnh | Tên sự kiện | Địa điểm | Thời gian | Trạng thái SK | Trạng thái duyệt | Thao tác
- Badge trạng thái sự kiện: Upcoming (xanh dương), Ongoing (xanh lá), Completed (xám), Cancelled (đỏ)
- Nút thao tác: [Sửa] [Xóa] [Xem chi tiết ↗]
- Nút [+ Thêm sự kiện]
- Phân trang

**Form Thêm/Sửa**
```
Fields:
  - eventName*          (text)
  - description*        (textarea)
  - location*           (text)
  - latitude, longitude (number)
  - startDate*          (datetime)
  - endDate*            (datetime)
  - categoryId*         (select)
  - adminUnitId         (select)
  - eventStatus         (select: Upcoming/Ongoing/Completed/Cancelled) — chỉ khi sửa
  - tags                (text)
  - ticketPrice         (text)
  - organizerName       (text)
  - organizerContact    (text)
```

**Liên kết:**
- Tương tự Place — click pending → tab Kiểm duyệt
- Sau tạo → nút "Quản lý ảnh"

---

### Phase 3: Kiểm duyệt (tab `moderation`)

#### 3.1 Service: `src/services/ModerationService.ts`
```
PATCH  /api/moderation/{resourceType}/{id}/approve  → approve(type, id)
PATCH  /api/moderation/{resourceType}/{id}/reject    → reject(type, id)
GET    /api/moderation/{resourceType}/{id}/logs      → getLogs(type, id)
GET    /api/places/all?PageNumber&PageSize            → (reuse, filter pending)
GET    /api/events/all?PageNumber&PageSize            → (reuse, filter pending)
```

#### 3.2 Slice: `src/store/slice/ModerationSlice.ts`
```typescript
State: {
  pendingPlaces: Place[]
  pendingEvents: Event[]
  logs: ModerationLog[]
  loading, actionLoading, error
  activeFilter: 'places' | 'events'
}

Thunks:
  - fetchPendingPlacesThunk({ page, size })
  - fetchPendingEventsThunk({ page, size })
  - approveThunk({ resourceType, id })
  - rejectThunk({ resourceType, id })
  - fetchLogsThunk({ resourceType, id })
```

#### 3.3 UI: Tab "Kiểm duyệt"

**Layout**
```
[Địa điểm chờ duyệt (3)] [Sự kiện chờ duyệt (1)]    ← sub-tabs với badge count
─────────────────────────────────────────────────────
| Ảnh | Tên | Người tạo | Ngày tạo | Thao tác      |
|     |     |           |          | [Duyệt][Từ chối][Chi tiết] |
```

- Click [Chi tiết] → mở modal xem đầy đủ thông tin + ảnh + lịch sử duyệt
- Click [Duyệt] → Swal confirm → `PATCH /api/moderation/place/{id}/approve`
- Click [Từ chối] → Swal confirm (có input lý do) → `PATCH /api/moderation/place/{id}/reject`
- Sau duyệt/từ chối → tự động refresh danh sách

**Liên kết:**
- Từ tab Địa điểm/Sự kiện, click badge "Pending" → nhảy sang đây
- Click tên item → mở chi tiết tại `/places/{id}` hoặc `/events/{id}`

---

### Phase 4: Quản lý Danh mục (tab `categories`)

#### 4.1 Service: `src/services/AdminCategoryService.ts`
```
GET    /api/categories?PageNumber&PageSize     → getAll(page, size)
GET    /api/categories/active                  → getActive()
GET    /api/categories/{id}                    → getById(id)
POST   /api/categories                         → create(payload)
PUT    /api/categories/{id}                    → update(id, payload)
DELETE /api/categories/{id}                    → delete(id)
```

#### 4.2 Slice: `src/store/slice/AdminCategorySlice.ts`
```typescript
State: {
  categories: Category[]
  totalCount, pageNumber, totalPages
  loading, actionLoading, error
}

Thunks:
  - fetchAdminCategoriesThunk({ page, size })
  - createCategoryThunk(payload)
  - updateCategoryThunk({ id, payload })
  - deleteCategoryThunk(id)
```

#### 4.3 UI: Tab "Quản lý Danh mục"

**Danh sách**
- Bảng: Tên | Loại (type) | Trạng thái | Thao tác
- Badge type: theme/style/activity/budget/companion
- Nút: [Sửa] [Xóa]
- Nút [+ Thêm danh mục]

**Form Thêm/Sửa (modal nhỏ)**
```
Fields:
  - categoryName*   (text)
  - categoryType*   (select: theme/style/activity/budget/companion)
  - isActive         (toggle)
```

---

### Phase 5: Quản lý Hình ảnh (modal dùng chung)

#### 5.1 Service: `src/services/MediaService.ts`
```
POST   /api/media/upload-signature             → getSignature(resourceType, resourceId)
POST   /api/media/finalize                     → finalize(payload)
GET    /api/media/by-resource?resourceType&resourceId → getByResource(type, id)
PATCH  /api/media/{id}/set-primary             → setPrimary(id)
PATCH  /api/media/reorder                      → reorder(ids[])
DELETE /api/media/{id}                         → delete(id)
```

#### 5.2 Slice: `src/store/slice/MediaSlice.ts`
```typescript
State: {
  mediaList: Media[]
  loading, uploading, error
}

Thunks:
  - fetchMediaThunk({ resourceType, resourceId })
  - uploadMediaThunk({ file, resourceType, resourceId })  // sign → upload cloudinary → finalize
  - setPrimaryThunk(id)
  - reorderThunk(ids)
  - deleteMediaThunk(id)
```

#### 5.3 UI: Component `MediaManager` (dùng chung cho Place & Event)

```
┌──────────────────────────────────────────┐
│  Quản lý hình ảnh - [Tên địa điểm]      │
│                                          │
│  [+ Upload ảnh]                          │
│                                          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ ★   │ │     │ │     │ │     │       │
│  │ img1│ │ img2│ │ img3│ │ img4│       │
│  │[Chính]│[Đặt ★]│[Đặt ★]│[Đặt ★]│       │
│  │ [Xóa]│ [Xóa]│ [Xóa]│ [Xóa]│       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                          │
│  Kéo thả để sắp xếp thứ tự             │
└──────────────────────────────────────────┘
```

- Upload: Lấy signature → upload lên Cloudinary trực tiếp → gọi finalize
- Hiện ảnh chính có icon sao (★)
- [Đặt ★] → `PATCH /api/media/{id}/set-primary`
- [Xóa] → Swal confirm → `DELETE /api/media/{id}`

**Liên kết:**
- Mở từ nút "Quản lý ảnh" ở form Place/Event
- Hoặc từ cột Thao tác trong bảng Place/Event

---

## PHẦN 2: CONTRIBUTOR (`/contributor`)

### Thay đổi routing

Đổi route `/administrative-units` → `/contributor` cho rõ ràng.
File: `src/routes/contributor.tsx` (đổi tên từ `administrative-units.tsx`)

Cập nhật `__root.tsx`:
```typescript
case 1: navigate({ to: '/contributor' }); break;
```

### Sidebar tabs

```
Tổng quan
Quản lý Địa điểm
Quản lý Sự kiện
Kiểm duyệt
Quản lý Hình ảnh
```

---

### Phase 6: Trang Contributor

#### 6.1 Dùng chung Service/Slice với Admin

Contributor và Admin gọi cùng API endpoints (`/api/places/all`, `/api/events/all`, `/api/moderation/...`).
Backend tự filter theo scope đơn vị hành chính của contributor.
→ **Reuse** AdminPlaceService, AdminEventService, ModerationService, MediaService.
→ **Reuse** các Slice tương ứng.

#### 6.2 UI: `src/page/ContributorPage.tsx`

**Layout**: Giống AdminPage nhưng sidebar khác, header title khác.

**Tab Tổng quan (đơn giản)**
- Hiển thị: Số địa điểm đang quản lý | Số sự kiện | Số chờ duyệt
- Lấy data từ `/api/places/all` và `/api/events/all` (count)

**Tab Quản lý Địa điểm**
- Giống Admin nhưng:
  - Chỉ thấy data trong scope đơn vị hành chính (backend filter)
  - adminUnitId tự động gán theo contributor (hoặc chỉ chọn đơn vị con)

**Tab Quản lý Sự kiện**
- Giống Admin, scope giới hạn

**Tab Kiểm duyệt**
- Giống Admin, chỉ thấy items trong scope
- Cấp trên duyệt items của cấp dưới

**Tab Quản lý Hình ảnh**
- Dùng chung component MediaManager

---

## PHẦN 3: COMPONENTS DÙNG CHUNG

Tách các component dùng chung để Admin và Contributor reuse:

### `src/components/admin/`

```
DataTable.tsx         — Bảng data với phân trang, loading, empty state
FormModal.tsx         — Modal form thêm/sửa (nhận fields config)
StatusBadge.tsx       — Badge trạng thái duyệt (Pending/Approved/Rejected)
EventStatusBadge.tsx  — Badge trạng thái SK (Upcoming/Ongoing/Completed/Cancelled)
MediaManager.tsx      — Component quản lý ảnh (upload, xóa, sắp xếp, đặt ảnh chính)
ModerationPanel.tsx   — Panel kiểm duyệt (danh sách pending + actions)
PlaceForm.tsx         — Form thêm/sửa địa điểm
EventForm.tsx         — Form thêm/sửa sự kiện
CategoryForm.tsx      — Form thêm/sửa danh mục
AdminSidebar.tsx      — Sidebar cho Admin
ContributorSidebar.tsx — Sidebar cho Contributor
```

---

## PHẦN 4: CẬP NHẬT STORE

File `src/store/index.ts` — thêm slice mới:

```typescript
import adminPlaces from './slice/AdminPlaceSlice';
import adminEvents from './slice/AdminEventSlice';
import adminCategories from './slice/AdminCategorySlice';
import moderation from './slice/ModerationSlice';
import media from './slice/MediaSlice';

export const store = configureStore({
  reducer: {
    // ... existing
    adminPlaces,
    adminEvents,
    adminCategories,
    moderation,
    media,
  },
});
```

---

## PHẦN 5: THỨ TỰ TRIỂN KHAI

```
Phase 1: Quản lý Địa điểm (Admin)
  ├── 1a. AdminPlaceService.ts
  ├── 1b. AdminPlaceSlice.ts
  ├── 1c. Thêm tab + bảng danh sách vào AdminPage
  ├── 1d. PlaceForm.tsx (modal thêm/sửa)
  └── 1e. Đăng ký slice vào store

Phase 2: Quản lý Sự kiện (Admin)
  ├── 2a. AdminEventService.ts
  ├── 2b. AdminEventSlice.ts
  ├── 2c. Thêm tab + bảng danh sách
  ├── 2d. EventForm.tsx (modal thêm/sửa)
  └── 2e. Đăng ký slice vào store

Phase 3: Kiểm duyệt (Admin)
  ├── 3a. ModerationService.ts
  ├── 3b. ModerationSlice.ts
  ├── 3c. Thêm tab kiểm duyệt
  └── 3d. Modal chi tiết + lịch sử duyệt

Phase 4: Quản lý Danh mục (Admin)
  ├── 4a. AdminCategoryService.ts
  ├── 4b. AdminCategorySlice.ts
  ├── 4c. Thêm tab + bảng + form modal
  └── 4d. Đăng ký slice

Phase 5: Quản lý Hình ảnh (dùng chung)
  ├── 5a. MediaService.ts
  ├── 5b. MediaSlice.ts
  ├── 5c. MediaManager.tsx component
  ├── 5d. Tích hợp vào form Place/Event
  └── 5e. Đăng ký slice

Phase 6: Contributor Page
  ├── 6a. Đổi route → /contributor
  ├── 6b. ContributorPage.tsx (layout + sidebar)
  ├── 6c. Reuse components từ Phase 1-5
  ├── 6d. Tab tổng quan đơn giản
  └── 6e. Cập nhật __root.tsx redirect

Phase 7: Tách components dùng chung
  ├── 7a. Tách DataTable, StatusBadge, FormModal
  ├── 7b. Refactor AdminPage dùng components chung
  └── 7c. Refactor ContributorPage dùng components chung
```

---

## PHẦN 6: CHI TIẾT ĐIỀU HƯỚNG LIÊN KẾT

```
Dashboard (Tổng quan)
  ├── Card "Địa điểm" → click → tab Quản lý Địa điểm
  ├── Card "Sự kiện"  → click → tab Quản lý Sự kiện
  ├── Card "Chờ duyệt" → click → tab Kiểm duyệt
  └── Card "Đánh giá"  → (chỉ hiển thị số)

Quản lý Địa điểm
  ├── Badge "Pending" → click → tab Kiểm duyệt (filter place)
  ├── Nút [Quản lý ảnh] → mở MediaManager modal
  ├── Nút [Xem chi tiết ↗] → mở /places/{id} (tab mới)
  └── Select danh mục → load từ CategoryService

Quản lý Sự kiện
  ├── Badge "Pending" → click → tab Kiểm duyệt (filter event)
  ├── Nút [Quản lý ảnh] → mở MediaManager modal
  └── Nút [Xem chi tiết ↗] → mở /events/{id} (tab mới)

Kiểm duyệt
  ├── Click tên item → mở /places/{id} hoặc /events/{id}
  ├── Sau duyệt → refresh + hiện toast thành công
  └── Nút [Lịch sử] → mở modal logs

Quản lý Danh mục
  └── (độc lập, không cần điều hướng đặc biệt)
```

---

## Ghi chú kỹ thuật

- Tất cả form dùng `controlled components` (useState cho từng field)
- Confirm actions dùng `Swal.fire()` theo pattern hiện có
- Loading overlay dùng pattern `actionLoading` như AdminPage hiện tại
- Pagination dùng pattern `pageNumber/totalPages` + nút Trước/Sau
- Responsive: bảng có `overflow-x-auto` + `min-w-[800px]`
- Icons dùng `lucide-react` nhất quán
- Màu sắc: giữ nguyên theme hiện tại (primary `#00008A`, cards trắng, bg `gray-50`)
