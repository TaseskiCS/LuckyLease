import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import cuid from 'cuid';

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
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_senderId_fkey(id, name, email),
        receiver:users!messages_receiverId_fkey(id, name, email)
      `)
      .eq('listingId', listingId)
      .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ messages: messages || [] });
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
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Verify receiver exists
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id')
      .eq('id', receiverId)
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Create message
    const { data: message, error: createError } = await supabase
      .from('messages')
      .insert({
        id: cuid(),
        content,
        senderId: senderId,
        receiverId: receiverId,
        listingId: listingId,
        timestamp: new Date()
      })
      .select(`
        *,
        sender:users!messages_senderId_fkey(id, name, email),
        receiver:users!messages_receiverId_fkey(id, name, email)
      `)
      .single();

    if (createError) {
      console.error('Supabase error:', createError);
      return res.status(500).json({ error: 'Database error' });
    }

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
    const { data: conversations, error } = await supabase
      .from('messages')
      .select(`
        *,
        listing:listings(id, title, imageUrls),
        sender:users!messages_senderId_fkey(id, name, email),
        receiver:users!messages_receiverId_fkey(id, name, email)
      `)
      .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Group conversations by listing and other user
    const conversationMap = new Map();
    
    (conversations || []).forEach(msg => {
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