// Type definitions for Letter API
// This file can be shared with the frontend

export interface UploadAttachmentResponse {
  success: boolean;
  data: {
    id: number;
    fileUrl: string;
  };
  message: string;
  timestamp: string;
}

export interface CreateLetterRequest {
  title: string;
  message: string;
  senderName?: string;
  coverImageUrl?: string;
  attachments: LetterAttachment[];
}

export interface LetterAttachment {
  fileUrl: string;
  text: string;
  type: 'image' | 'video';
  order: number;
}

export interface CreateLetterResponse {
  success: boolean;
  data: {
    id: number;
    publicId: string;
    editToken: string;
    title: string;
    message: string;
    senderName?: string;
    coverImageUrl?: string;
  };
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  timestamp: string;
  error?: any;
}

// Example usage for frontend

/**
 * Example: Upload a file
 * 
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 * 
 * const response = await fetch('http://localhost:8083/letters/upload-attachment', {
 *   method: 'POST',
 *   body: formData
 * });
 * 
 * const result: UploadAttachmentResponse = await response.json();
 * const fileUrl = result.data.fileUrl;
 */

/**
 * Example: Create a letter
 * 
 * const letterData: CreateLetterRequest = {
 *   title: "Happy Valentine's Day 💖",
 *   message: "ขอบคุณที่อยู่ข้างกันมาตลอดนะ",
 *   senderName: "Kittiphop",
 *   coverImageUrl: "http://localhost:9000/assets/attachments/cover.jpg",
 *   attachments: [
 *     {
 *       fileUrl: "http://localhost:9000/assets/attachments/image1.jpg",
 *       text: "รูปแรกของเรา",
 *       type: "image",
 *       order: 1
 *     }
 *   ]
 * };
 * 
 * const response = await fetch('http://localhost:8083/letters/create', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify(letterData)
 * });
 * 
 * const result: CreateLetterResponse = await response.json();
 * 
 * // Store these values for later use
 * const publicId = result.data.publicId;  // For public URL
 * const editToken = result.data.editToken; // For editing (keep this secret!)
 */
