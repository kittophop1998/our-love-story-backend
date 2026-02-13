export interface IAuthRepository {
    getUserByUsername(username: string): Promise<any>;
    createUser(fullname: string, nickname: string, username: string, passwordHash: string): Promise<void>;
    getUserById(id: number): Promise<any>;
}