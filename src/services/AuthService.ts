import jwt from 'jsonwebtoken';

export class AuthService {
  public authenticate(username: string, password: string) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password';

    if (username === adminUsername && password === adminPassword) {
      const payload = { username };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
      return { token };
    } else {
      return { error: 'Invalid credentials' };
    }
  }
}
