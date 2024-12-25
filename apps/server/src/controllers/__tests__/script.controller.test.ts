import { Request, Response } from 'express';
import { ScriptController } from '../script.controller';
import { ConditionType } from '@prisma/client';

// Create mock prisma instance
const mockedPrisma = {
  project: {
    findUnique: jest.fn(),
  },
  condition: {
    findMany: jest.fn(),
  },
};

jest.doMock('@libs/prisma', () => ({
  __esModule: true,
  default: mockedPrisma,
}));

describe('ScriptController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let scriptController: ScriptController;

  beforeEach(() => {
    mockRequest = {
      params: {},
      user: { id: 1, email: 'test@example.com' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    scriptController = new ScriptController();
    jest.clearAllMocks();
  });

  describe('getProjectScript', () => {
    it('should generate and return script successfully', async () => {
      const mockProject = {
        id: 1,
        userId: 1,
        name: 'Test Project',
        description: null,
        allowedUrls: ['example.com'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockConditions = [
        {
          id: 1,
          type: ConditionType.TIME_OF_DAY,
          value: '9:00-17:00',
          variation: 'daytime-content',
          projectId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRequest.params = { projectId: '1' };

      mockedPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockedPrisma.condition.findMany.mockResolvedValue(mockConditions);

      await scriptController.getProjectScript(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockedPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockedPrisma.condition.findMany).toHaveBeenCalledWith({
        where: { projectId: 1 },
      });
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/javascript'
      );
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  // Add more test cases for other methods
});
