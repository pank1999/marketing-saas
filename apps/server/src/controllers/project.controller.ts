import { Response } from 'express';
import prisma from '@libs/prisma';
import { AuthenticatedRequest } from '../types/auth';

export class ProjectController {
  async createProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description } = req.body;
      const userId = req.user.id;

      const project = await prisma.project.create({
        data: {
          name,
          description,
          userId,
        },
      });

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error creating project' });
    }
  }

  async getProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;

      const projects = await prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects' });
    }
  }

  async getProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const project = await prisma.project.findUnique({
        where: { id: parseInt(id) },
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching project' });
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const userId = req.user.id;

      const project = await prisma.project.findUnique({
        where: { id: parseInt(id) },
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updatedProject = await prisma.project.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
        },
      });

      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: 'Error updating project' });
    }
  }

  async deleteProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const project = await prisma.project.findUnique({
        where: { id: parseInt(id) },
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await prisma.project.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project' });
    }
  }
}
