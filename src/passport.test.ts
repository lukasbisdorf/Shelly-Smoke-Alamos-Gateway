import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { initializePassport } from './passport';

// Mock modules
jest.mock('passport', () => ({
    use: jest.fn(),
    initialize: jest.fn(() => 'passport-middleware')
}));

jest.mock('passport-jwt', () => ({
    Strategy: jest.fn(),
    ExtractJwt: {
        fromAuthHeaderAsBearerToken: jest.fn(() => 'bearer-extractor')
    }
}));

describe('passport', () => {
    let app: any;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Mock Express app
        app = {
            use: jest.fn()
        };
        
        // Reset mocks
        jest.clearAllMocks();
        
        // Save original env
        originalEnv = process.env;
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('initializePassport', () => {
        it('should initialize passport with JWT strategy', () => {
            initializePassport(app);
            
            expect(ExtractJwt.fromAuthHeaderAsBearerToken).toHaveBeenCalled();
            expect(JwtStrategy).toHaveBeenCalledWith(
                expect.objectContaining({
                    jwtFromRequest: 'bearer-extractor',
                    secretOrKey: 'your_jwt_secret'
                }),
                expect.any(Function)
            );
            expect(passport.use).toHaveBeenCalled();
            expect(app.use).toHaveBeenCalledWith('passport-middleware');
        });

        it('should use JWT_SECRET from environment if available', () => {
            process.env.JWT_SECRET = 'test_secret';
            
            initializePassport(app);
            
            expect(JwtStrategy).toHaveBeenCalledWith(
                expect.objectContaining({
                    secretOrKey: 'test_secret'
                }),
                expect.any(Function)
            );
        });

        it('should call done with jwt_payload in strategy callback', () => {
            initializePassport(app);
            
            // Extract the callback function passed to JwtStrategy
            const jwtStrategyCallback = (JwtStrategy as jest.Mock).mock.calls[0][1];
            
            const mockPayload = { id: '123', name: 'test' };
            const mockDone = jest.fn();
            
            jwtStrategyCallback(mockPayload, mockDone);
            
            expect(mockDone).toHaveBeenCalledWith(null, mockPayload);
        });
    });
});