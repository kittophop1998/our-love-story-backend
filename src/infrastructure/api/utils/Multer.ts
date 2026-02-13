import multer from 'multer';
import { Request } from 'express';

// กำหนดประเภทไฟล์ที่รับ
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm'
];

// กำหนดขนาดไฟล์สูงสุด (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// ใช้ memory storage เพื่อเก็บไฟล์ใน buffer
const storage = multer.memoryStorage();

// ฟังก์ชันตรวจสอบไฟล์
const fileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
  }
};

// สร้าง multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
