import { Request, Response } from 'express';
import { ProjectController } from '../project.controller';

const mockedPrisma = {
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.doMock('@libs/prisma', () => ({
  __esModule: true,
  default: mockedPrisma,
}));

describe('ProjectController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let projectController: ProjectController;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { id: 1, email: 'test@example.com' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    projectController = new ProjectController();
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        userId: 1,
        allowedUrls: ['example.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = {
        name: 'Test Project',
        description: 'Test Description',
      };

      mockedPrisma.project.create.mockResolvedValue(mockProject);

      await projectController.createProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockedPrisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Project',
          description: 'Test Description',
          userId: 1,
          allowedUrls: [],
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
    });
  });

  // Add more test cases for other methods
});
