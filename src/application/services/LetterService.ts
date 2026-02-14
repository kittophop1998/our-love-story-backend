import { LetterRepository, CreateLetterData, CreateAttachmentData } from "../../infrastructure/database/LetterRepository";
import { uploadFile, getSignedDownloadUrl } from "../../infrastructure/api/utils/S3";
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import sharp from "sharp";

export interface CreateLetterRequest {
    title: string;
    message: string;
    senderName?: string;
    coverImageUrl?: string;
    attachments: Array<{
        fileUrl: string;
        text: string;
        type: 'image' | 'video';
        order: number;
    }>;
}

export class LetterService {
    constructor(
        private letterRepository: LetterRepository
    ) { }

    async createLetter(data: CreateLetterRequest) {
        const publicId = this.generatePublicId();
        const editToken = this.generateEditToken();
        const editTokenHash = this.hashEditToken(editToken);

        console.log(data);

        const letterData: CreateLetterData = {
            title: data.title,
            message: data.message,
            public_id: publicId,
            edit_token_hash: editTokenHash,
            sender_name: data.senderName,
            cover_image_url: data.coverImageUrl,
        };

        const letter = await this.letterRepository.createLetter(letterData);

        if (data.attachments && data.attachments.length > 0) {
            console.log(JSON.stringify(data.attachments, null, 2));
            const attachmentsData: CreateAttachmentData[] = data.attachments.map(att => ({
                letter_id: letter.id,
                file_url: att.fileUrl,
                text: att.text,
                type: att.type,
                order: att.order,
            }));

            await this.letterRepository.createLetterAttachments(attachmentsData);
        }

        return {
            id: letter.id,
            publicId: letter.public_id,
            editToken,
            title: letter.title,
            message: letter.message,
            senderName: letter.sender_name,
            coverImageUrl: letter.cover_image_url,
        };
    }

    async uploadAttachment(file: Express.Multer.File) {
        // บีบอัดรูปภาพก่อนอัปโหลด
        const compressedBuffer = await this.compressImage(file.buffer, file.mimetype);

        const fileExtension = this.getFileExtension(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;

        const uploadResult = await uploadFile({
            file: compressedBuffer,
            key: fileName,
            contentType: file.mimetype,
            metadata: {
                originalName: file.originalname,
                uploadedAt: new Date().toISOString(),
            },
            acl: 'public-read-write'
        });

        const s3Key = String(uploadResult.key);
        const fileUrl = this.constructFileUrl(s3Key);
        const id = await this.letterRepository.createUploadedFile(fileUrl);

        return {
            id,
            fileurl: `${uploadResult.bucket}/${s3Key}`,
        };
    }

    private async compressImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
        const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        // ถ้าไม่ใช่รูปภาพที่รองรับ ให้ return buffer เดิม
        if (!supportedFormats.includes(mimetype)) {
            return buffer;
        }

        try {
            let sharpInstance = sharp(buffer);

            // ลดขนาดรูปถ้าใหญ่เกินไป (max width: 1920px)
            const metadata = await sharpInstance.metadata();
            if (metadata.width && metadata.width > 1920) {
                sharpInstance = sharpInstance.resize(1920, null, {
                    withoutEnlargement: true,
                    fit: 'inside',
                });
            }

            // บีบอัดตามประเภทของไฟล์
            switch (mimetype) {
                case 'image/jpeg':
                    return await sharpInstance
                        .jpeg({ quality: 80, mozjpeg: true })
                        .toBuffer();
                case 'image/png':
                    return await sharpInstance
                        .png({ compressionLevel: 8, quality: 80 })
                        .toBuffer();
                case 'image/webp':
                    return await sharpInstance
                        .webp({ quality: 80 })
                        .toBuffer();
                case 'image/gif':
                    // GIF ไม่สามารถบีบอัดได้มากนัก
                    return await sharpInstance
                        .gif()
                        .toBuffer();
                default:
                    return buffer;
            }
        } catch (error) {
            console.error('Error compressing image:', error);
            // ถ้าเกิด error ให้ return buffer เดิม
            return buffer;
        }
    }

    async getLetterByPublicId(publicId: string) {
        const letter = await this.letterRepository.getLetterByPublicId(publicId);

        if (!letter) {
            return null;
        }

        // Get signed URLs for all attachments
        const attachmentsWithSignedUrls = await Promise.all(
            letter.attachments.map(async (attachment: any) => {
                try {
                    const key = this.extractKeyFromFileUrl(attachment.fileUrl);
                    const signedUrlResult = await getSignedDownloadUrl({
                        key,
                        bucket: process.env.S3_BUCKET || 'our-love-story',
                        expiresIn: 3600, // 1 hour
                    });

                    return {
                        id: attachment.id,
                        fileUrl: attachment.fileUrl,
                        signedUrl: signedUrlResult.url,
                        text: attachment.text,
                        type: attachment.type,
                        order: attachment.order,
                    };
                } catch (error) {
                    console.error(`Error generating signed URL for attachment ${attachment.id}:`, error);
                    console.error('Error details:', JSON.stringify(error, null, 2));
                    return {
                        id: attachment.id,
                        fileUrl: attachment.fileUrl,
                        signedUrl: null,
                        text: attachment.text,
                        type: attachment.type,
                        order: attachment.order,
                    };
                }
            })
        );

        let coverImageSignedUrl = null;
        if (letter.coverImageUrl) {
            try {
                const coverKey = this.extractKeyFromFileUrl(letter.coverImageUrl);
                console.log('Getting signed URL for cover image. Original URL:', letter.coverImageUrl, 'Key:', coverKey);

                const signedUrlResult = await getSignedDownloadUrl({
                    key: coverKey,
                    bucket: process.env.S3_BUCKET || 'our-love-story',
                    expiresIn: 3600,
                });
                coverImageSignedUrl = signedUrlResult.url;
                console.log('Cover image signed URL generated successfully');
            } catch (error) {
                console.error(`Error generating signed URL for cover image:`, error);
                console.error('Error details:', JSON.stringify(error, null, 2));
            }
        }

        return {
            id: letter.id,
            title: letter.title,
            message: letter.message,
            publicId: letter.publicId,
            editTokenHash: letter.editTokenHash,
            senderName: letter.senderName,
            coverImageUrl: letter.coverImageUrl,
            coverImageSignedUrl: coverImageSignedUrl,
            viewCount: letter.viewCount,
            createdAt: letter.createdAt,
            updatedAt: letter.updatedAt,
            attachments: attachmentsWithSignedUrls,
        };
    }

    async getLetterByEditTokenHash(editTokenHash: string) {
        const letter = await this.letterRepository.getLetterByEditTokenHash(editTokenHash);
        return letter;
    }

    private generatePublicId(): string {
        return crypto.randomBytes(4).toString('hex');
    }

    private generateEditToken(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    private hashEditToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    private getFileExtension(filename: string): string {
        const parts = filename.split('.');
        return parts.length > 1 ? `.${parts.pop()}` : '';
    }

    /**
     * Extract S3/MinIO key from file URL
     * รองรับทั้ง:
     * - bucket/key format
     * - http://endpoint/bucket/key format
     * - https://bucket.s3.region.amazonaws.com/key format
     */
    private extractKeyFromFileUrl(fileUrl: string): string {
        console.log('🔍 Extracting key from fileUrl:', fileUrl);
        console.log('Type of fileUrl:', typeof fileUrl);

        // ตรวจสอบว่า fileUrl เป็น string จริง ๆ
        if (typeof fileUrl !== 'string') {
            console.error('❌ fileUrl is not a string!', fileUrl);
            return String(fileUrl); // พยายาม convert เป็น string
        }

        // ถ้าเป็น URL เต็ม (มี http/https)
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            try {
                const url = new URL(fileUrl);
                const pathname = url.pathname;
                const bucket = process.env.S3_BUCKET || 'our-love-story';

                console.log('  ↳ Parsing as full URL. Pathname:', pathname);

                // ถ้าเป็น path-style (MinIO): /bucket/key -> ต้องตัด /bucket/ ออก
                if (pathname.startsWith(`/${bucket}/`)) {
                    const key = pathname.substring(`/${bucket}/`.length);
                    console.log('  ✅ Extracted key (path-style):', key);
                    return key;
                }

                // ถ้าเป็น virtual-hosted-style (AWS S3): /key
                const key = pathname.startsWith('/') ? pathname.substring(1) : pathname;
                console.log('  ✅ Extracted key (virtual-hosted):', key);
                return key;
            } catch (error) {
                console.error('  ❌ Error parsing URL:', error);
                return fileUrl;
            }
        }

        // ถ้าเป็น format: bucket/key
        const parts = fileUrl.split('/');
        if (parts.length > 1) {
            const key = parts.slice(1).join('/');
            console.log('  ✅ Extracted key (bucket/key format):', key);
            return key;
        }

        console.log('  ✅ Using fileUrl as-is:', fileUrl);
        return fileUrl;
    }

    private constructFileUrl(key: string): string {
        const bucket = process.env.S3_BUCKET || 'our-love-story';

        // สำหรับ MinIO หรือ S3-compatible storage ที่มี custom endpoint
        if (process.env.S3_ENDPOINT) {
            const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, ''); // ลบ trailing slash
            const usePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';

            if (usePathStyle) {
                // Path-style URL (จำเป็นสำหรับ MinIO): http://endpoint/bucket/key
                return `${endpoint}/${bucket}/${key}`;
            } else {
                // Virtual-hosted-style URL: http://bucket.endpoint/key
                const endpointWithoutProtocol = endpoint.replace(/^https?:\/\//, '');
                const protocol = endpoint.startsWith('https') ? 'https' : 'http';
                return `${protocol}://${bucket}.${endpointWithoutProtocol}/${key}`;
            }
        }

        // สำหรับ AWS S3 ปกติ
        const region = process.env.S3_REGION || 'us-east-1';
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }
}