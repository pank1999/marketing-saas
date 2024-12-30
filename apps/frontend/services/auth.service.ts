import {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
} from '../types/auth';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ||
  'https://marketing-saas.pankajpandey.dev/api';

class AuthService {
  private tokenKey = 'marketing-saas-token';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to signup');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.tokenKey);
      return token;
    }
    return null;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(this.tokenKey);
        resolve(!!token);
      } else {
        resolve(false);
      }
    });
  }
}

export const authService = new AuthService();
