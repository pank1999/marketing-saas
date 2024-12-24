import { Request, Response } from 'express';
import prisma from '@libs/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

export const getUserProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const project = await prisma.project.findFirst({
      where: {
        id: Number(id),
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;

    // First check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: Number(id),
        userId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        description,
      },
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // First check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: Number(id),
        userId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await prisma.project.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};
