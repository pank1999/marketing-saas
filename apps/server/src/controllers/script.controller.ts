import { Request, Response } from 'express';
import prisma from '@libs/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { ScriptGenerator } from '../services/script-generator.service';

const scriptGenerator = new ScriptGenerator();

export const getProjectScript = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
      },
      include: {
        conditions: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const script = scriptGenerator.generateScript(
      project.conditions,
      project.allowedUrls || []
    );

    // Set appropriate headers for JavaScript content
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(script);
  } catch (error) {
    console.error('Get script error:', error);
    res.status(500).json({ message: 'Error generating script' });
  }
};

export const getScriptInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const scriptUrl = `${
      process.env.API_URL || 'http://localhost:3000/api'
    }/scripts/${projectId}`;
    const embedCode = `<script src="${scriptUrl}"></script>`;

    res.json({
      scriptUrl,
      embedCode,
      allowedUrls: project.allowedUrls || [],
      instructions: `
        To use this script:
        1. Add the script tag to your HTML:
           ${embedCode}
        2. The script will automatically:
           - Verify the current domain is allowed
           - Check time-based conditions
           - Request location permission for weather/temperature conditions
           - Update the URL with the appropriate variation parameter
        3. Conditions are checked every 5 minutes
      `,
    });
  } catch (error) {
    console.error('Get script info error:', error);
    res.status(500).json({ message: 'Error getting script info' });
  }
};

export const updateAllowedUrls = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { allowedUrls } = req.body;
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

    // Validate URLs format
    const urlPattern = /^[a-zA-Z0-9-.*]+\.[a-zA-Z0-9-.]*[a-zA-Z0-9-]+$/;
    const invalidUrls = allowedUrls.filter(
      (url: string) => !urlPattern.test(url)
    );
    if (invalidUrls.length > 0) {
      return res.status(400).json({
        message: 'Invalid URL format',
        invalidUrls,
      });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: Number(projectId),
      },
      data: {
        allowedUrls,
      },
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Update allowed URLs error:', error);
    res.status(500).json({ message: 'Error updating allowed URLs' });
  }
};
