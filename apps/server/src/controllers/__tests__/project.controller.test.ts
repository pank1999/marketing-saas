import { Request, Response } from 'express';
import { ProjectController } from '../project.controller';
import { prisma } from '@libs/prisma';

jest.mock('@libs/prisma', () => ({
  prisma: {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ProjectController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let projectController: ProjectController;

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
    projectController = new ProjectController();
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        userId: 1,
      };

      mockRequest.body = {
        name: 'Test Project',
        description: 'Test Description',
      };

      (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);

      await projectController.createProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Project',
          description: 'Test Description',
          userId: 1,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('getProjects', () => {
    it('should return all projects for the user', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1', userId: 1 },
        { id: 2, name: 'Project 2', userId: 1 },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      await projectController.getProjects(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockProjects);
    });
  });

  describe('getProject', () => {
    it('should return a specific project', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        userId: 1,
      };

      mockRequest.params = { id: '1' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      await projectController.getProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 if project not found', async () => {
      mockRequest.params = { id: '999' };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await projectController.getProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project not found',
      });
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const mockProject = {
        id: 1,
        name: 'Updated Project',
        description: 'Updated Description',
        userId: 1,
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Updated Project',
        description: 'Updated Description',
      };

      (prisma.project.update as jest.Mock).mockResolvedValue(mockProject);

      await projectController.updateProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Project',
          description: 'Updated Description',
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      mockRequest.params = { id: '1' };

      await projectController.deleteProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project deleted successfully',
      });
    });
  });
});
