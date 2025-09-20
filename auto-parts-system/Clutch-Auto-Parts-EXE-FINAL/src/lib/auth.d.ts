export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface LoginCredentials {
    username: string;
    password: string;
}
export interface AuthResult {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
}
export declare class AuthManager {
    private db;
    private currentUser;
    private jwtSecret;
    constructor();
    initialize(): Promise<void>;
    login(username: string, password: string): Promise<AuthResult>;
    logout(): Promise<AuthResult>;
    getCurrentUser(): Promise<User | null>;
    verifyToken(token: string): Promise<AuthResult>;
    createUser(userData: Partial<User> & {
        password: string;
    }): Promise<AuthResult>;
    updateUser(userId: number, userData: Partial<User>): Promise<AuthResult>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<AuthResult>;
    getAllUsers(): Promise<User[]>;
    deleteUser(userId: number): Promise<AuthResult>;
    hasPermission(user: User, permission: string): boolean;
}
//# sourceMappingURL=auth.d.ts.map