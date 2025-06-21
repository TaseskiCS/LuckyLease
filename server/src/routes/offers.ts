import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import cuid from 'cuid';

const router = Router();

// Validation middleware
const validateOffer = [
  body('amount').isFloat({ min: 0 }),
  body('message').trim().isLength({ min: 1, max: 500 }),
  body('listingId').notEmpty(),
  body('toUserId').notEmpty(),
];

// Get offers for a listing
router.get('/listing/:listingId', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { userId } = req.user!;

    // Get offers where user is either sender or receiver
    const { data: offers, error } = await supabase
      .from('offers')
      .select(`
        *,
        fromUser:users(id, name, email),
        toUser:users(id, name, email),
        listing:listings(id, title, price)
      `)
      .eq('listingId', listingId)
      .or(`fromUserId.eq.${userId},toUserId.eq.${userId}`)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ offers: offers || [] });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send an offer
router.post('/', validateOffer, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, message, listingId, toUserId } = req.body;
    const fromUserId = req.user!.userId;

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
      .eq('id', toUserId)
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check if user already sent an offer for this listing
    const { data: existingOffer, error: existingError } = await supabase
      .from('offers')
      .select('id')
      .eq('listingId', listingId)
      .eq('fromUserId', fromUserId)
      .eq('toUserId', toUserId)
      .single();

    if (existingOffer) {
      return res.status(400).json({ error: 'You have already sent an offer for this listing' });
    }

    // Create offer
    const { data: offer, error: createError } = await supabase
      .from('offers')
      .insert({
        id: cuid(),
        amount: parseFloat(amount),
        message,
        listingId,
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .select(`
        *,
        fromUser:users(id, name, email),
        toUser:users(id, name, email),
        listing:listings(id, title, price)
      `)
      .single();

    if (createError) {
      console.error('Supabase error:', createError);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      message: 'Offer sent successfully',
      data: offer
    });
  } catch (error) {
    console.error('Send offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update offer status (accept/reject)
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { userId } = req.user!;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "rejected"' });
    }

    // Get the offer
    const { data: offer, error: findError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Only the receiver can update the status
    if (offer.toUserId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this offer' });
    }

    // Update offer status
    const { data: updatedOffer, error: updateError } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        fromUser:users(id, name, email),
        toUser:users(id, name, email),
        listing:listings(id, title, price)
      `)
      .single();

    if (updateError) {
      console.error('Supabase error:', updateError);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      message: 'Offer status updated successfully',
      data: updatedOffer
    });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's offers (sent and received)
router.get('/user/me', async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;

    const [sentOffers, receivedOffers] = await Promise.all([
      supabase
        .from('offers')
        .select(`
          *,
          fromUser:users(id, name, email),
          toUser:users(id, name, email),
          listing:listings(id, title, price, imageUrls)
        `)
        .eq('fromUserId', userId)
        .order('createdAt', { ascending: false }),
      supabase
        .from('offers')
        .select(`
          *,
          fromUser:users(id, name, email),
          toUser:users(id, name, email),
          listing:listings(id, title, price, imageUrls)
        `)
        .eq('toUserId', userId)
        .order('createdAt', { ascending: false })
    ]);

    res.json({
      sentOffers: sentOffers || [],
      receivedOffers: receivedOffers || []
    });
  } catch (error) {
    console.error('Get user offers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 