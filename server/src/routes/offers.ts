import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';

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
    const offers = await prisma.offer.findMany({
      where: {
        listingId,
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ offers });
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
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: toUserId }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check if user already sent an offer for this listing
    const existingOffer = await prisma.offer.findFirst({
      where: {
        listingId,
        fromUserId,
        toUserId
      }
    });

    if (existingOffer) {
      return res.status(400).json({ error: 'You have already sent an offer for this listing' });
    }

    // Create offer
    const offer = await prisma.offer.create({
      data: {
        amount: parseFloat(amount),
        message,
        listingId,
        fromUserId,
        toUserId,
        status: 'pending'
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    });

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
    const offer = await prisma.offer.findUnique({
      where: { id }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Only the receiver can update the status
    if (offer.toUserId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this offer' });
    }

    // Update offer status
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { status },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    });

    res.json({
      message: `Offer ${status} successfully`,
      data: updatedOffer
    });
  } catch (error) {
    console.error('Update offer status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's offers (sent and received)
router.get('/user/me', async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;

    const [sentOffers, receivedOffers] = await Promise.all([
      prisma.offer.findMany({
        where: { fromUserId: userId },
        include: {
          toUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrls: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.offer.findMany({
        where: { toUserId: userId },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrls: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      sentOffers,
      receivedOffers
    });
  } catch (error) {
    console.error('Get user offers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 