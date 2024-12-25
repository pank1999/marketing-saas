import { Request, Response } from 'express';
import { ScriptController } from '../script.controller';
import { prisma } from '@libs/prisma';
import { ScriptGenerator } from '../../services/script-generator.service';

jest.mock('@libs/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    condition: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../../services/script-generator.service', () => ({
  ScriptGenerator: jest.fn().mockImplementation(() => ({
    generateScript: jest.fn().mockReturnValue('generated script content'),
  })),
}));

describe('ScriptController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let scriptController: ScriptController;

  beforeEach(() => {
    mockRequest = {
      params: {},
      user: { id: 1 },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    scriptController = new ScriptController();
  });

  describe('getProjectScript', () => {
    it('should return generated script for a project', async () => {
      const mockProject = {
        id: 1,
        userId: 1,
        allowedUrls: ['example.com'],
      };

      const mockConditions = [
        { type: 'TIME_OF_DAY', value: '9:00-17:00', variation: 'daytime' },
        { type: 'WEATHER', value: 'sunny', variation: 'sunny-content' },
      ];

      mockRequest.params = { projectId: '1' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.condition.findMany as jest.Mock).mockResolvedValue(
        mockConditions
      );

      await scriptController.getProjectScript(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.condition.findMany).toHaveBeenCalledWith({
        where: { projectId: 1 },
      });
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/javascript'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        'generated script content'
      );
    });

    it('should return 404 if project not found', async () => {
      mockRequest.params = { projectId: '999' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await scriptController.getProjectScript(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project not found',
      });
    });
  });

  describe('getScriptInfo', () => {
    it('should return script information for a project', async () => {
      const mockProject = {
        id: 1,
        userId: 1,
      };

      mockRequest.params = { projectId: '1' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      await scriptController.getScriptInfo(
        mockRequest as Request,
        mockResponse as Response
      );

      const expectedScriptUrl = `/api/scripts/${mockProject.id}`;
      const expectedEmbedCode = `<script src="${expectedScriptUrl}"></script>`;

      expect(mockResponse.json).toHaveBeenCalledWith({
        scriptUrl: expectedScriptUrl,
        embedCode: expectedEmbedCode,
      });
    });

    it('should return 404 if project not found', async () => {
      mockRequest.params = { projectId: '999' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await scriptController.getScriptInfo(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project not found',
      });
    });
  });
});
