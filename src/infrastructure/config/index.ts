import { loadEnv } from "./loadEnv";
loadEnv();

export const config = {
    port: parseInt(process.env.PORT || '8083', 10),
    database: {
        host: process.env.DB_HOST || 'switchback.proxy.rlwy.net',
        port: parseInt(process.env.DB_PORT || '14953', 10),
        name: process.env.DB_NAME || 'railway',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Q4NkdE-xszWlcXODWck13eWOYb_2I45v',
    },
    setting: {
        allowOrigin: process.env.ALLOW_ORIGIN || 'https://assetto.up.railway.app',
    },
    s3: {
        endpoint: process.env.S3_ENDPOINT || undefined, // ใส่ URL สำหรับ MinIO เช่น http://localhost:9000
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        bucket: process.env.S3_BUCKET || 'assets',
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // ต้องเป็น true สำหรับ MinIO
    },
};

export default config;
