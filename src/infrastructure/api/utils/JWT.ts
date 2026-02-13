import jwt from 'jsonwebtoken';

export interface UserMetadata {
    id: number;
    username: string;
    nickname: string;
    fullname: string;
    email: string;
}

export class JWTService {
    private static readonly SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    private static readonly EXPIRES_IN = '24h';

    /**
     * Generate JWT token with user metadata
     */
    static generateToken(userMetadata: UserMetadata): string {
        const payload = {
            id: userMetadata.id,
            username: userMetadata.username,
            fullname: userMetadata.fullname,
            nickname: userMetadata.nickname,
            email: userMetadata.email
        };

        return jwt.sign(payload, this.SECRET_KEY, {
            expiresIn: this.EXPIRES_IN,
        });
    }

    /**
     * Verify JWT token
     */
    static verifyToken(token: string): UserMetadata {
        try {
            const decoded = jwt.verify(token, this.SECRET_KEY) as UserMetadata;
            return decoded;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Decode JWT token without verification
     */
    static decodeToken(token: string): UserMetadata | null {
        try {
            const decoded = jwt.decode(token) as UserMetadata;
            return decoded;
        } catch (error) {
            return null;
        }
    }
}
