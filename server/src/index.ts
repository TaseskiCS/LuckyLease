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

import { authenticateToken } from './middleware/auth';
import { setupSocketHandlers } from './sockets/socketHandler';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET','POST'],
  },
});

// ← Change default port here back to 5000
const PORT = Number(process.env.PORT) || 5000;

// Rate limiting
const limiter = rateLimit({ windowMs:15*60*1000, max:100 });

app.use(helmet());
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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

// ← Mount your email sender on the same path your React is POSTing to:
app.use('/api/contact', sendEmail);

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

server.listen(PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);
