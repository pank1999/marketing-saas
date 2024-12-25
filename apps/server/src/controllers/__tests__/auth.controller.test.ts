import { Request, Response } from 'express';
import { AuthController } from '../auth.controller';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Mock modules
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const mockedPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.doMock('@libs/prisma', () => ({
  __esModule: true,
  default: mockedPrisma,
}));

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let authController: AuthController;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    authController = new AuthController();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return success response', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUserResponse = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockedPrisma.user.create.mockResolvedValue(mockUser);

      await authController.signup(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword123',
          name: 'Test User',
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: mockUserResponse,
      });
    });

    it('should handle duplicate email error', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockedPrisma.user.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`email`)')
      );

      await authController.signup(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email already exists',
      });
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken123');

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123'
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id },
        process.env['JWT_SECRET'] || 'your-secret-key',
        { expiresIn: '24h' }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'mockToken123',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
    });

    it('should handle invalid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockedPrisma.user.findUnique.mockResolvedValue(null);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });
  });
});
