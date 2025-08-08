# 📋 คำสั่งสำหรับ Manus - Forgot Password API Endpoints

## 🎯 Overview
สร้าง 3 API endpoints สำหรับระบบ Forgot Password ที่ Frontend เตรียมไว้แล้ว

---

## 🔐 1. POST /auth/forgot-password

**คำอธิบาย:** ขอรีเซ็ตรหัสผ่าน - ส่งอีเมลพร้อมลิงก์รีเซ็ต

### Request
```json
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Response Success (200)
```json
{
  "message": "Password reset link sent to your email",
  "email": "user@example.com"
}
```

### Response Errors
- **404**: Email address not found
- **429**: Too many requests - rate limiting
- **400**: Invalid email format

### Implementation Notes
- สร้าง reset token (UUID) ที่หมดอายุใน 30 นาที
- เก็บ token ใน database พร้อม user_id และ expiry_time
- ส่งอีเมลไปที่ user พร้อมลิงก์: `https://domain.com/reset-password?token={token}`
- Rate limiting: 3 requests ต่อ 15 นาที ต่อ IP

---

## 🔍 2. GET /auth/verify-reset-token

**คำอธิบาย:** ตรวจสอบความถูกต้องของ reset token

### Request
```
GET /auth/verify-reset-token?token=reset-token-uuid
```

### Response Success (200)
```json
{
  "valid": true,
  "message": "Token is valid"
}
```

### Response Errors
- **404**: Token not found or expired
- **410**: Token already used
- **400**: Invalid token format

### Implementation Notes
- ตรวจสอบ token ใน database
- ตรวจสอบไม่หมดอายุ (created_at + 30 minutes > now)
- ตรวจสอบยังไม่ถูกใช้ (used_at is null)

---

## 🔄 3. POST /auth/reset-password

**คำอธิบาย:** รีเซ็ตรหัสผ่านด้วย token

### Request
```json
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-uuid",
  "new_password": "newpassword123"
}
```

### Response Success (200)
```json
{
  "message": "Password reset successfully"
}
```

### Response Errors
- **400**: Invalid or expired token
- **422**: Password validation failed
- **410**: Token already used

### Implementation Notes
- ตรวจสอบ token เหมือน verify-reset-token
- Hash password ใหม่และอัปเดทในฐานข้อมูล
- Mark token เป็น used (used_at = current_timestamp)
- Password validation: ขั้นต่ำ 6 ตัวอักษร

---

## 📊 Database Schema

### สร้างตาราง password_reset_tokens

```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    ip_address INET
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);
```

---

## 📧 Email Service

### ตัวอย่างเนื้อหาอีเมล

**Subject:** Reset Your Password - Auth System

```html
Hi {username},

You requested to reset your password. Click the link below to reset:

{reset_link}

This link will expire in 30 minutes.

If you didn't request this, please ignore this email.

Best regards,
Auth System Team
```

---

## ⚙️ Configuration

### ตัวแปรสภาพแวดล้อมที่ต้องการ

```env
FRONTEND_URL=http://localhost:5174
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USERNAME=your-email
SMTP_PASSWORD=your-password
RESET_TOKEN_EXPIRY_MINUTES=30
```

---

## 🧪 Testing Commands

### 1. Request Reset
```bash
curl -X POST http://localhost:8000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Verify Token
```bash
curl -X GET "http://localhost:8000/auth/verify-reset-token?token=your-token"
```

### 3. Reset Password
```bash
curl -X POST http://localhost:8000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token", "new_password": "newpass123"}'
```

---

## 🚀 Status

- ✅ **Frontend**: พร้อมแล้ว (ForgotPassword.jsx, ResetPassword.jsx)
- ⏳ **Backend**: รอ Manus implement API endpoints
- ⏳ **Email Service**: รอ setup SMTP configuration

## 📝 Next Steps

1. Implement 3 API endpoints ตามข้างต้น
2. Setup email service (SMTP)
3. สร้าง database table
4. Test integration กับ frontend

**หมายเหตุ:** Frontend UI พร้อมใช้งานแล้ว สามารถทดสอบได้ที่:
- `/forgot-password` - หน้าขอรีเซ็ตรหัสผ่าน  
- `/reset-password?token=test` - หน้าตั้งรหัสผ่านใหม่
