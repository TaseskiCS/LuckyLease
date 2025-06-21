import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining a listing conversation
    socket.on('join-listing', (listingId: string) => {
      socket.join(`listing:${listingId}`);
      console.log(`User ${socket.userId} joined listing ${listingId}`);
    });

    // Handle leaving a listing conversation
    socket.on('leave-listing', (listingId: string) => {
      socket.leave(`listing:${listingId}`);
      console.log(`User ${socket.userId} left listing ${listingId}`);
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      try {
        const { content, receiverId, listingId } = data;

        // Emit to the listing room
        io.to(`listing:${listingId}`).emit('new-message', {
          content,
          senderId: socket.userId,
          receiverId,
          listingId,
          timestamp: new Date()
        });

        // Emit to the receiver's personal room for notifications
        io.to(`user:${receiverId}`).emit('message-notification', {
          content,
          senderId: socket.userId,
          listingId,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing-start', (data) => {
      const { listingId, receiverId } = data;
      socket.to(`listing:${listingId}`).emit('user-typing', {
        userId: socket.userId,
        listingId
      });
    });

    socket.on('typing-stop', (data) => {
      const { listingId } = data;
      socket.to(`listing:${listingId}`).emit('user-stop-typing', {
        userId: socket.userId,
        listingId
      });
    });

    // Handle new offer
    socket.on('send-offer', (data) => {
      const { amount, message, receiverId, listingId } = data;

      // Emit to the receiver's personal room
      io.to(`user:${receiverId}`).emit('new-offer', {
        amount,
        message,
        senderId: socket.userId,
        listingId,
        timestamp: new Date()
      });
    });

    // Handle offer status update
    socket.on('offer-status-update', (data) => {
      const { offerId, status, senderId } = data;

      // Emit to the offer sender
      io.to(`user:${senderId}`).emit('offer-status-changed', {
        offerId,
        status,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
}; 