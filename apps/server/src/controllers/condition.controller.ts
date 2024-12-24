import { Request, Response } from 'express';
import prisma from '@libs/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createCondition = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, type, value, variation } = req.body;
    const userId = req.user?.id;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const condition = await prisma.condition.create({
      data: {
        type,
        value,
        variation,
        projectId: Number(projectId),
      },
    });

    res.status(201).json(condition);
  } catch (error) {
    console.error('Create condition error:', error);
    res.status(500).json({ message: 'Error creating condition' });
  }
};

export const getProjectConditions = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        userId,
      },
      include: {
        conditions: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project.conditions);
  } catch (error) {
    console.error('Get conditions error:', error);
    res.status(500).json({ message: 'Error fetching conditions' });
  }
};

export const updateCondition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type, value, variation } = req.body;
    const userId = req.user?.id;

    // Verify condition ownership through project
    const condition = await prisma.condition.findFirst({
      where: {
        id: Number(id),
        project: {
          userId,
        },
      },
    });

    if (!condition) {
      return res.status(404).json({ message: 'Condition not found' });
    }

    const updatedCondition = await prisma.condition.update({
      where: {
        id: Number(id),
      },
      data: {
        type,
        value,
        variation,
      },
    });

    res.json(updatedCondition);
  } catch (error) {
    console.error('Update condition error:', error);
    res.status(500).json({ message: 'Error updating condition' });
  }
};

export const deleteCondition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify condition ownership through project
    const condition = await prisma.condition.findFirst({
      where: {
        id: Number(id),
        project: {
          userId,
        },
      },
    });

    if (!condition) {
      return res.status(404).json({ message: 'Condition not found' });
    }

    await prisma.condition.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete condition error:', error);
    res.status(500).json({ message: 'Error deleting condition' });
  }
};
