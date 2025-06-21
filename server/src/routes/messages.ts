import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';

const router = Router();

// Validation middleware
const validateMessage = [
  body('content').trim().isLength({ min: 1, max: 1000 }),
  body('receiverId').notEmpty(),
  body('listingId').notEmpty(),
];

// Get messages for a specific listing/conversation
router.get('/listing/:listingId', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { userId } = req.user!;

    // Get messages where user is either sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        listingId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a message
router.post('/', validateMessage, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, receiverId, listingId } = req.body;
    const senderId = req.user!.userId;

    // Verify the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        listingId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's conversations
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;

    // Get all conversations where user is involved
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            imageUrls: true
          }
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Group conversations by listing and other user
    const conversationMap = new Map();
    
    conversations.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const key = `${msg.listingId}-${otherUserId}`;
      
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          listingId: msg.listingId,
          listing: msg.listing,
          otherUser: msg.senderId === userId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: 0
        });
      }
    });

    const conversationList = Array.from(conversationMap.values());

    res.json({ conversations: conversationList });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 