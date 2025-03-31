import { AuthService } from './AuthService';
import jwt from 'jsonwebtoken';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;
    const mockToken = 'mock-jwt-token';
    const originalEnv = process.env;

    beforeEach(() => {
        authService = new AuthService();
        // Mock jwt.sign to return a predictable token
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);
        
        // Reset process.env before each test
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    test('should authenticate with correct default credentials', () => {
        // Act
        const result = authService.authenticate('admin', 'password');

        // Assert
        expect(result).toEqual({ token: mockToken });
        expect(jwt.sign).toHaveBeenCalledWith(
            { username: 'admin' },
            'your_jwt_secret',
            { expiresIn: '1h' }
        );
    });

    test('should authenticate with correct custom credentials', () => {
        // Arrange
        process.env.ADMIN_USERNAME = 'custom_admin';
        process.env.ADMIN_PASSWORD = 'custom_password';
        process.env.JWT_SECRET = 'custom_secret';

        // Act
        const result = authService.authenticate('custom_admin', 'custom_password');

        // Assert
        expect(result).toEqual({ token: mockToken });
        expect(jwt.sign).toHaveBeenCalledWith(
            { username: 'custom_admin' },
            'custom_secret',
            { expiresIn: '1h' }
        );
    });

    test('should return error with incorrect username', () => {
        // Act
        const result = authService.authenticate('wrong_user', 'password');

        // Assert
        expect(result).toEqual({ error: 'Invalid credentials' });
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('should return error with incorrect password', () => {
        // Act
        const result = authService.authenticate('admin', 'wrong_password');

        // Assert
        expect(result).toEqual({ error: 'Invalid credentials' });
        expect(jwt.sign).not.toHaveBeenCalled();
    });
});