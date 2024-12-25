import { Request, Response } from 'express';
import { AuthController } from '../auth.controller';
import { prisma } from '@libs/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('@libs/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
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
  });

  describe('signup', () => {
    it('should create a new user and return success response', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      await authController.signup(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword123',
          name: 'Test User',
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: mockUser,
      });
    });

    it('should handle duplicate email error', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (prisma.user.create as jest.Mock).mockRejectedValue(
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
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken123');

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123'
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'mockToken123',
        user: mockUser,
      });
    });

    it('should handle invalid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

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
