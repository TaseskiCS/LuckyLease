import { Router, Request, Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { uploadImage, deleteImage } from '../utils/supabase';
import { generateListingSummary } from '../utils/gemini';

const router = Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Validation middleware
const validateListing = [
  body('title').trim().isLength({ min: 5, max: 100 }),
  body('description').trim().isLength({ min: 20, max: 1000 }),
  body('price').isFloat({ min: 0 }),
  body('location').trim().isLength({ min: 2, max: 100 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('contactMethod').isIn(['email', 'in_app']),
];

// Get all listings with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      location,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (location) {
      where.location = {
        contains: location as string,
        mode: 'insensitive'
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (startDate) {
      where.startDate = {
        gte: new Date(startDate as string)
      };
    }

    if (endDate) {
      where.endDate = {
        lte: new Date(endDate as string)
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.listing.count({ where })
    ]);

    res.json({
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single listing
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create listing
router.post('/', authenticateToken, upload.array('images', 10), validateListing, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      price,
      location,
      startDate,
      endDate,
      contactMethod
    } = req.body;

    // Upload images
    const imageUrls: string[] = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;
        const fileName = `${Date.now()}-${i}-${file.originalname}`;
        const imageUrl = await uploadImage(file.buffer, fileName);
        imageUrls.push(imageUrl);
      }
    }

    // Generate AI summary
    const aiData = await generateListingSummary(title, description, parseFloat(price), location);

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        userId: req.user!.userId,
        title,
        description,
        price: parseFloat(price),
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrls,
        contactMethod,
        summary: aiData.summary,
        tags: aiData.tags
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update listing
router.put('/:id', authenticateToken, upload.array('images', 10), validateListing, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      title,
      description,
      price,
      location,
      startDate,
      endDate,
      contactMethod
    } = req.body;

    // Check if listing exists and user owns it
    const existingListing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    // Handle image uploads
    let imageUrls = existingListing.imageUrls;
    if (req.files && req.files.length > 0) {
      const newImageUrls: string[] = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;
        const fileName = `${Date.now()}-${i}-${file.originalname}`;
        const imageUrl = await uploadImage(file.buffer, fileName);
        newImageUrls.push(imageUrl);
      }
      imageUrls = newImageUrls;
    }

    // Generate new AI summary
    const aiData = await generateListingSummary(title, description, parseFloat(price), location);

    // Update listing
    const listing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price),
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrls,
        contactMethod,
        summary: aiData.summary,
        tags: aiData.tags
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete listing
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if listing exists and user owns it
    const listing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    // Delete images from storage
    for (const imageUrl of listing.imageUrls) {
      try {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await deleteImage(fileName);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    // Delete listing
    await prisma.listing.delete({
      where: { id }
    });

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's listings
router.get('/user/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { userId: req.user!.userId },
      include: {
        _count: {
          select: {
            likes: true,
            messages: true,
            offers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ listings });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 