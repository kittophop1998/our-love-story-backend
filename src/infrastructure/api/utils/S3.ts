import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { config } from '../../config';

const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
  forcePathStyle: config.s3.forcePathStyle,
});

export interface UploadFileParams {
  file: Buffer | Readable;
  key: string;
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
}

export interface DownloadFileParams {
  key: string;
  bucket?: string;
}

export interface DeleteFileParams {
  key: string;
  bucket?: string;
}

export interface GetSignedUrlParams {
  key: string;
  bucket?: string;
  expiresIn?: number;
}

export interface ListFilesParams {
  prefix?: string;
  bucket?: string;
  maxKeys?: number;
}

export interface CopyFileParams {
  sourceKey: string;
  destinationKey: string;
  sourceBucket?: string;
  destinationBucket?: string;
}

/**
 * อัพโหลดไฟล์ไปยัง S3/MinIO
 */
export async function uploadFile(params: UploadFileParams) {
  const { file, key, bucket = config.s3.bucket, contentType, metadata, acl } = params;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        ACL: acl,
      },
    });

    const result = await upload.done();
    
    return {
      success: true,
      key: key,
      bucket: bucket,
      location: result.Location,
      etag: result.ETag,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

/**
 * ดาวน์โหลดไฟล์จาก S3/MinIO
 */
export async function downloadFile(params: DownloadFileParams) {
  const { key, bucket = config.s3.bucket } = params;

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    return {
      success: true,
      body: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error('Error downloading file from S3:', error);
    throw error;
  }
}

/**
 * ลบไฟล์จาก S3/MinIO
 */
export async function deleteFile(params: DeleteFileParams) {
  const { key, bucket = config.s3.bucket } = params;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
    
    return {
      success: true,
      message: `File ${key} deleted successfully`,
    };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}

/**
 * สร้าง Signed URL สำหรับดาวน์โหลดไฟล์ชั่วคราว
 */
export async function getSignedDownloadUrl(params: GetSignedUrlParams) {
  const { key, bucket = config.s3.bucket, expiresIn = 3600 } = params;

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return {
      success: true,
      url: signedUrl,
      expiresIn: expiresIn,
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * สร้าง Signed URL สำหรับอัพโหลดไฟล์ชั่วคราว
 */
export async function getSignedUploadUrl(params: GetSignedUrlParams) {
  const { key, bucket = config.s3.bucket, expiresIn = 3600 } = params;

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return {
      success: true,
      url: signedUrl,
      expiresIn: expiresIn,
    };
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    throw error;
  }
}

export default {
  uploadFile,
  downloadFile,
  deleteFile,
  getSignedDownloadUrl,
  getSignedUploadUrl,
  s3Client,
};