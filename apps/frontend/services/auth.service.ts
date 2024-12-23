import {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
} from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class AuthService {
  private token: string | null = null;

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
    this.saveToken(data.token);
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
    this.saveToken(data.token);
    return data;
  }

  saveToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('token');
      if (token) this.token = token;
      return token;
    }
    return null;
  }

  removeToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
    }
  }

  isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(!!this.getToken());
    });
  }
}

export const authService = new AuthService();
