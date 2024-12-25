import { Request, Response } from 'express';
import { ConditionController } from '../condition.controller';
import { prisma } from '@libs/prisma';
import { ConditionType } from '@prisma/client';

jest.mock('@libs/prisma', () => ({
  prisma: {
    condition: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  },
}));

describe('ConditionController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let conditionController: ConditionController;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { id: 1 },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    conditionController = new ConditionController();
  });

  describe('createCondition', () => {
    it('should create a new condition', async () => {
      const mockCondition = {
        id: 1,
        type: ConditionType.TIME_OF_DAY,
        value: '9:00-17:00',
        variation: 'daytime-content',
        projectId: 1,
      };

      mockRequest.body = {
        type: ConditionType.TIME_OF_DAY,
        value: '9:00-17:00',
        variation: 'daytime-content',
        projectId: 1,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
      });
      (prisma.condition.create as jest.Mock).mockResolvedValue(mockCondition);

      await conditionController.createCondition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.condition.create).toHaveBeenCalledWith({
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

    it('should return 404 if project not found', async () => {
      mockRequest.body = {
        type: ConditionType.TIME_OF_DAY,
        value: '9:00-17:00',
        variation: 'daytime-content',
        projectId: 999,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await conditionController.createCondition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project not found',
      });
    });
  });

  describe('getProjectConditions', () => {
    it('should return all conditions for a project', async () => {
      const mockConditions = [
        { id: 1, type: ConditionType.TIME_OF_DAY, projectId: 1 },
        { id: 2, type: ConditionType.WEATHER, projectId: 1 },
      ];

      mockRequest.params = { projectId: '1' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
      });
      (prisma.condition.findMany as jest.Mock).mockResolvedValue(
        mockConditions
      );

      await conditionController.getProjectConditions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.condition.findMany).toHaveBeenCalledWith({
        where: { projectId: 1 },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockConditions);
    });
  });

  describe('updateCondition', () => {
    it('should update a condition', async () => {
      const mockCondition = {
        id: 1,
        type: ConditionType.WEATHER,
        value: 'sunny',
        variation: 'sunny-content',
        projectId: 1,
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        type: ConditionType.WEATHER,
        value: 'sunny',
        variation: 'sunny-content',
      };

      (prisma.condition.findUnique as jest.Mock).mockResolvedValue({
        ...mockCondition,
        project: { userId: 1 },
      });
      (prisma.condition.update as jest.Mock).mockResolvedValue(mockCondition);

      await conditionController.updateCondition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.condition.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          type: ConditionType.WEATHER,
          value: 'sunny',
          variation: 'sunny-content',
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockCondition);
    });
  });

  describe('deleteCondition', () => {
    it('should delete a condition', async () => {
      mockRequest.params = { id: '1' };
      (prisma.condition.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        project: { userId: 1 },
      });

      await conditionController.deleteCondition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.condition.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Condition deleted successfully',
      });
    });
  });
});
