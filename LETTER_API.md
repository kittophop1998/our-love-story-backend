# Letter API Documentation

## Endpoints

### 1. Upload Attachment
อัพโหลดไฟล์รูปภาพหรือวิดีโอไปยัง MinIO และบันทึกข้อมูลลงฐานข้อมูล

**Endpoint:** `POST /letters/upload-attachment`

**Content-Type:** `multipart/form-data`

**Request:**
- `file` (required): ไฟล์ที่ต้องการอัพโหลด (รองรับ image/video, max 50MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fileUrl": "http://localhost:9000/assets/attachments/uuid-filename.jpg"
  },
  "message": "Upload attachment successful"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8083/letters/upload-attachment \
  -F "file=@/path/to/image.jpg"
```

---

### 2. Create Letter
สร้างจดหมายพร้อมไฟล์แนบ

**Endpoint:** `POST /letters/create`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "title": "Happy Valentine's Day 💖",
  "message": "ขอบคุณที่อยู่ข้างกันมาตลอดนะ",
  "senderName": "Kittiphop",
  "coverImageUrl": "https://cdn.yoursite.com/temp/cover-uuid.jpg",
  "attachments": [
    {
      "fileUrl": "https://cdn.yoursite.com/temp/uuid-1.jpg",
      "text": "รูปแรกของเรา",
      "type": "image",
      "order": 1
    },
    {
      "fileUrl": "https://cdn.yoursite.com/temp/uuid-2.jpg",
      "text": "วันนั้นเธอยิ้มหวานมาก",
      "type": "image",
      "order": 2
    },
    {
      "fileUrl": "https://cdn.yoursite.com/temp/uuid-3.mp4",
      "text": "คลิปเซอร์ไพรส์ 💕",
      "type": "video",
      "order": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "publicId": "a1b2c3d4",
    "editToken": "0123456789abcdef0123456789abcdef",
    "title": "Happy Valentine's Day 💖",
    "message": "ขอบคุณที่อยู่ข้างกันมาตลอดนะ",
    "senderName": "Kittiphop",
    "coverImageUrl": "https://cdn.yoursite.com/temp/cover-uuid.jpg"
  },
  "message": "Create letter successful"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8083/letters/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Happy Valentine'\''s Day 💖",
    "message": "ขอบคุณที่อยู่ข้างกันมาตลอดนะ",
    "senderName": "Kittiphop",
    "coverImageUrl": "http://localhost:9000/assets/attachments/cover.jpg",
    "attachments": [
      {
        "fileUrl": "http://localhost:9000/assets/attachments/image1.jpg",
        "text": "รูปแรกของเรา",
        "type": "image",
        "order": 1
      }
    ]
  }'
```

---

## Workflow

1. **อัพโหลดไฟล์ก่อน** (cover image และ attachments)
   - เรียก `POST /letters/upload-attachment` สำหรับแต่ละไฟล์
   - เก็บ `fileUrl` ที่ได้รับจาก response

2. **สร้างจดหมาย**
   - เรียก `POST /letters/create` พร้อม URL ของไฟล์ทั้งหมด
   - เก็บ `publicId` และ `editToken` ไว้ใช้งานต่อ
   - `publicId` ใช้สำหรับเข้าถึงจดหมาย (public URL)
   - `editToken` ใช้สำหรับแก้ไขจดหมาย (ต้องเก็บไว้ฝั่ง client)

---

## Database Schema

### uploaded_files
เก็บข้อมูลไฟล์ที่อัพโหลด (อาจจะยังไม่ได้ใช้ในจดหมายใดๆ)
```sql
- id (PK)
- fileUrl
- createdAt
- updatedAt
```

### letters
เก็บข้อมูลจดหมาย
```sql
- id (PK)
- title
- message
- publicId (unique, สำหรับ public URL)
- editTokenHash (hash ของ edit token)
- senderName
- coverImageUrl
- viewCount
- createdAt
- updatedAt
```

### letter_attachments
เก็บไฟล์แนบของจดหมาย
```sql
- id (PK)
- letterId (FK -> letters.id)
- fileUrl
- text
- type (image/video)
- order
- createdAt
- updatedAt
```

---

## Error Handling

**400 Bad Request:**
```json
{
  "success": false,
  "message": "No file uploaded",
  "error": null
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Upload attachment failed",
  "error": "Error details..."
}
```
