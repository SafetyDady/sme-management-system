# Dev Report – User Management System Refactor

## 1. ปัญหาที่ตรวจพบ

### 1.1 โครงสร้างโค้ด `backend/routers/users.py` เสียหาย
- Import statement แตกกลางคำ เช่น `is_acti...ve`
- Duplicate imports
- String และ keyword แตกครึ่ง (syntax error)
- ทำให้ FastAPI ไม่สามารถโหลด router ได้

### 1.2 ระบบ Permission ซ้ำซ้อน
- มีหลาย dependency ตรวจสิทธิ์ เช่น:
  - `require_hr_or_admin` (legacy)
  - `requiredRole` และ `hasRole` ฝั่ง frontend
  - API บางจุดใช้ `require_admin_or_superadmin` บางจุดใช้ `require_hr_or_admin`
- ทำให้สิทธิ์ไม่สอดคล้องกันระหว่าง Backend และ Frontend

### 1.3 Role Naming ไม่เป็นมาตรฐาน
- Backend ส่ง role: `admin1`, `admin2`, `superadmin`, `hr`, `user`
- Frontend ใช้ mapping: `superadmin > admin > hr > user`
- `admin1`/`admin2` ทำให้ระบบ normalize role ยุ่งยาก และตรวจสิทธิ์ผิดพลาดได้

### 1.4 การ Mapping Role → Dashboard
- ตอนนี้ทุก role ถูก redirect ไป `/dashboard` เดียวกัน แล้วแยก render ใน frontend
- ส่งผลให้ UI ซับซ้อน และ permission checking ฝั่ง UI เสี่ยงต่อ bug

---

## 2. แนวทางแก้ไข

### 2.1 แทนที่ `routers/users.py` ด้วยเวอร์ชันใหม่
- ใช้ไฟล์ **`users_router_fixed.py`** ที่สร้างไว้ (drop-in replacement)
- ใช้ unified permission system (`require_superadmin`, `require_admin_or_superadmin`, `require_user_manage`)
- ใช้ safe DB access ผ่าน `safe_db.py` ทุกจุด

### 2.2 ลบ dependency legacy
- ลบทุกการเรียก `require_hr_or_admin` และโค้ดตรวจ role แบบ hard-coded
- ใช้ dependency จาก `dependencies/auth.py` เท่านั้น

### 2.3 ล็อก role ให้เป็น canonical
- ปรับ schema ใน `schemas.py`:
  ```python
  role: Literal["user", "admin", "superadmin", "hr"]
  ```
- แก้ใน `auth.py` หรือ `/auth/me` ให้ map:
  ```python
  if role in ["admin1", "admin2"]:
      role = "admin"
  ```

### 2.4 ปรับโครงสร้าง Dashboard Routing
- แยก route ตาม role เช่น:
  ```
  /superadmin/dashboard
  /admin/dashboard
  /hr/dashboard
  /user/dashboard
  ```
- Super Admin Dashboard รวม component จาก role อื่นได้

---

## 3. Task List สำหรับ Copilot

### 3.1 แทนที่ไฟล์
- [ ] นำโค้ดจาก `users_router_fixed.py` ไปแทน `backend/routers/users.py`
- [ ] ลบโค้ดเก่าและ import ซ้ำซ้อน

### 3.2 อัปเดต Permission
- [ ] ตรวจทุก endpoint ใน `/routers` ว่าใช้ dependency จาก `dependencies/auth.py`
- [ ] ลบ legacy `require_hr_or_admin`

### 3.3 ปรับ Role Mapping
- [ ] แก้ `schemas.py` ให้ใช้ role literal
- [ ] อัปเดต `auth.py` mapping role

### 3.4 ทดสอบ API
- [ ] GET `/users` (admin/superadmin เท่านั้น)
- [ ] POST `/users` (unique username/email)
- [ ] PUT `/users/{id}`
- [ ] DELETE `/users/{id}`
- [ ] POST `/users/{id}/password`
- [ ] GET `/users/_debug/schema` (superadmin เท่านั้น)

---

## 4. Expected Output หลังแก้ไข
- API `/users` ทำงานได้ครบ CRUD และเปลี่ยนรหัสผ่าน
- Permission ทำงานตรงตาม Role Mapping ใหม่
- Syntax error ใน `users.py` หาย
- Role name สอดคล้องกันทั้ง backend และ frontend
- Dashboard Redirect ชัดเจน แยกตาม role
