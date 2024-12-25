import { Request, Response } from 'express';
import { ConditionController } from '../condition.controller';
import prisma from '@libs/prisma';
import { ConditionType } from '@prisma/client';

jest.mock('@libs/prisma', () => ({
  default: {
    project: {
      findUnique: jest.fn(),
    },
    condition: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockedPrisma = jest.mocked(prisma);

describe('ConditionController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let conditionController: ConditionController;

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
    conditionController = new ConditionController();
    jest.clearAllMocks();
  });

  describe('createCondition', () => {
    it('should create a condition successfully', async () => {
      const mockProject = {
        id: 1,
        userId: 1,
        name: 'Test Project',
        description: null,
        allowedUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCondition = {
        id: 1,
        type: ConditionType.TIME_OF_DAY,
        value: '9:00-17:00',
        variation: 'daytime-content',
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = {
        type: ConditionType.TIME_OF_DAY,
        value: '9:00-17:00',
        variation: 'daytime-content',
        projectId: 1,
      };

      mockedPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockedPrisma.condition.create.mockResolvedValue(mockCondition);

      await conditionController.createCondition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockedPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockedPrisma.condition.create).toHaveBeenCalledWith({
        data: {
          type: ConditionType.TIME_OF_DAY,
          value: '9:00-17:00',
          variation: 'daytime-content',
          projectId: 1,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCondition);
    });
  });

  // Add more test cases for other methods
});
