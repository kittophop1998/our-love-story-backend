import bcrypt from 'bcrypt';

export class Password {
    private static readonly SALT_ROUNDS = 10;

    /**
     * Hash a plain text password
     * @param password - Plain text password to hash
     * @returns Hashed password
     */
    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Compare a plain text password with a hashed password
     * @param password - Plain text password
     * @param hashedPassword - Hashed password to compare against
     * @returns True if passwords match, false otherwise
     */
    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
