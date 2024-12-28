import express from 'express';
import * as path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import conditionRoutes from './routes/condition.routes';
import weatherRoutes from './routes/weather.routes';
import scriptRoutes from './routes/script.routes';
import dotenv from 'dotenv';

const app = express();

dotenv.config();

// Middleware
app.use(
  cors({
    origin: process.env['CORS_ORIGIN'] || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/conditions', conditionRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/weather', weatherRoutes);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to server!' });
});

// Create health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

const port = process.env['PORT'] || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

// Configure server timeouts
server.timeout = 30000; // 30 seconds
server.keepAliveTimeout = 65000; // Recommended to be higher than timeout

server.on('error', console.error);
