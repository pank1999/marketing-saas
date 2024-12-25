import { Response } from 'express';
import prisma from '@libs/prisma';
import { ScriptGenerator } from '../services/script-generator.service';
import { AuthenticatedRequest } from '../types/auth';

export class ScriptController {
  private scriptGenerator: ScriptGenerator;

  constructor() {
    this.scriptGenerator = new ScriptGenerator();
  }

  async getProjectScript(req: AuthenticatedRequest, res: Response) {
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

      const script = this.scriptGenerator.generateScript(
        conditions,
        project.allowedUrls
      );

      res.setHeader('Content-Type', 'application/javascript');
      res.send(script);
    } catch (error) {
      res.status(500).json({ message: 'Error generating script' });
    }
  }

  async getScriptInfo(req: AuthenticatedRequest, res: Response) {
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

      const scriptUrl = `/api/scripts/${project.id}`;
      const embedCode = `<script src="${scriptUrl}"></script>`;

      res.json({
        scriptUrl,
        embedCode,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching script info' });
    }
  }
}
