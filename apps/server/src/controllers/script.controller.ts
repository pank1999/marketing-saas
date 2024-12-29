import { Request, Response } from 'express';
import prisma from '@libs/prisma';
import { ScriptGenerator } from '../services/script-generator.service';
import { AuthenticatedRequest } from '../types/auth';

export class ScriptController {
  private scriptGenerator: ScriptGenerator;

  constructor() {
    this.scriptGenerator = new ScriptGenerator();
  }

  // This will be a public route
  serveProjectScript = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      // Optional: Check the referer header to validate the request origin
      const referer = req.headers.referer || req.headers.origin;

      const project = await prisma.project.findUnique({
        where: { id: parseInt(projectId) },
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Validate if the request is coming from an allowed domain
      if (project.allowedUrls && project.allowedUrls.length > 0) {
        const isAllowedOrigin = project.allowedUrls.some(
          (url) => referer && new URL(referer).origin.includes(url)
        );

        if (!isAllowedOrigin) {
          return res.status(403).json({ message: 'Domain not allowed' });
        }
      }

      const conditions = await prisma.condition.findMany({
        where: { projectId: parseInt(projectId) },
      });

      const script = this.scriptGenerator.generateScript(
        conditions,
        project.allowedUrls
      );

      // Set CORS headers to allow the script to be loaded from allowed domains
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/javascript');
      res.send(script);
    } catch (error) {
      res.status(500).json({ message: 'Error generating script' });
    }
  };

  // This route remains authenticated
  getScriptInfo = async (req: AuthenticatedRequest, res: Response) => {
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

      const scriptUrl = `${process.env['NEXT_PUBLIC_API_URL']}/scripts/${project.id}`;
      const embedCode = `<script src="${scriptUrl}"></script>`;

      res.json({
        scriptUrl,
        embedCode,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error fetching script info' });
    }
  };
}
