import { Response } from 'express';
import prisma from '@libs/prisma/prisma';
import { ConditionType } from '@prisma/client';
import { AuthenticatedRequest } from '../types/auth';

export class ConditionController {
  async createCondition(req: AuthenticatedRequest, res: Response) {
    try {
      const { type, value, variation, projectId } = req.body;
      const userId = req.user.id;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const condition = await prisma.condition.create({
        data: {
          type: type as ConditionType,
          value,
          variation,
          projectId,
        },
      });

      res.status(201).json(condition);
    } catch (error) {
      res.status(500).json({ message: 'Error creating condition' });
    }
  }

  async getProjectConditions(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const project = await prisma.project.findUnique({
        where: { id: parseInt(projectId) },
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const conditions = await prisma.condition.findMany({
        where: { projectId: parseInt(projectId) },
      });

      res.json(conditions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching conditions' });
    }
  }

  async updateCondition(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { type, value, variation } = req.body;
      const userId = req.user.id;

      const condition = await prisma.condition.findUnique({
        where: { id: parseInt(id) },
        include: { project: true },
      });

      if (!condition) {
        return res.status(404).json({ message: 'Condition not found' });
      }

      if (condition.project.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updatedCondition = await prisma.condition.update({
        where: { id: parseInt(id) },
        data: {
          type: type as ConditionType,
          value,
          variation,
        },
      });

      res.json(updatedCondition);
    } catch (error) {
      res.status(500).json({ message: 'Error updating condition' });
    }
  }

  async deleteCondition(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const condition = await prisma.condition.findUnique({
        where: { id: parseInt(id) },
        include: { project: true },
      });

      if (!condition) {
        return res.status(404).json({ message: 'Condition not found' });
      }

      if (condition.project.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await prisma.condition.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Condition deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting condition' });
    }
  }
}
