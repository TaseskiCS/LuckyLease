// /server/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';
import messageRoutes from './routes/messages';
import offerRoutes from './routes/offers';
import ratingRoutes from './routes/rating';
import sendEmail from './routes/email';
import luckyOpinionRoutes from './routes/lucky-opinion';

import { authenticateToken } from './middleware/auth';
import { setupSocketHandlers } from './sockets/socketHandler';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3000/',
      ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
    ],
    methods: ['GET','POST'],
  },
});

// Port configuration for Render deployment
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Rate limiting
const limiter = rateLimit({ windowMs:15*60*1000, max:100 });

app.use(helmet());
app.use(cors({ 
  origin: [
    'http://localhost:3000',
    'http://localhost:3000/',
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
  ],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));

app.get('/health', (_req:Request, res:Response) => {
  res.json({ status:'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/offers', authenticateToken, offerRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/contact', sendEmail);
app.use('/api/lucky-opinion', luckyOpinionRoutes);

setupSocketHandlers(io);

app.use('*', (_req:Request, res:Response) =>
  res.status(404).json({ error:'Route not found' })
);

app.use((err:any, _req:Request, res:Response, _next:NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error:'Something went wrong!',
    message: process.env.NODE_ENV==='development' ? err.message : 'Internal server error'
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server listening on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port binding to: ${HOST}:${PORT}`);
});

// Handle server startup errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});
