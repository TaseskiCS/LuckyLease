import { Router, Request, Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import { authenticateToken } from '../middleware/auth';
import { uploadImage, deleteImage } from '../utils/supabase';
import cuid from 'cuid';

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
  body('contactMethod').isIn(['email', 'in_app', 'sms']),
  body('bedrooms').isString(),
  body('bathrooms').isString(),
  body('school').optional().isString(),
  body('petsAllowed').isBoolean(),
  body('laundryInBuilding').isBoolean(),
  body('parkingAvailable').isBoolean(),
  body('airConditioning').isBoolean(),
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
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase
      .from('listings')
      .select(`
        *,
        user:users(id, name, email),
        likes:likes(count)
      `)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply filters
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice as string));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice as string));
    }

    if (startDate) {
      query = query.gte('startDate', startDate as string);
    }

    if (endDate) {
      query = query.lte('endDate', endDate as string);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { data: listings, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    // Apply same filters to count query
    if (location) {
      countQuery = countQuery.ilike('location', `%${location}%`);
    }
    if (minPrice) {
      countQuery = countQuery.gte('price', parseFloat(minPrice as string));
    }
    if (maxPrice) {
      countQuery = countQuery.lte('price', parseFloat(maxPrice as string));
    }
    if (startDate) {
      countQuery = countQuery.gte('startDate', startDate as string);
    }
    if (endDate) {
      countQuery = countQuery.lte('endDate', endDate as string);
    }
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { count: total } = await countQuery;

    res.json({
      listings: listings || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total || 0,
        pages: Math.ceil((total || 0) / limitNum)
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

    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        user:users(id, name, email),
        likes:likes(count)
      `)
      .eq('id', id)
      .single();

    if (error || !listing) {
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
      contactMethod,
      bedrooms,
      bathrooms,
      school,
      petsAllowed,
      laundryInBuilding,
      parkingAvailable,
      airConditioning
    } = req.body;

    // Upload images
    const imageUrls: string[] = [];
    console.log('Files received:', req.files?.length || 0);
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;
        console.log('Processing file:', file.originalname, file.size);
        const fileName = `${Date.now()}-${i}-${file.originalname}`;
        try {
          const imageUrl = await uploadImage(file.buffer, fileName);
          console.log('Uploaded image URL:', imageUrl);
          imageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          throw uploadError;
        }
      }
    }
    console.log('Final imageUrls:', imageUrls);

    // Create listing
    const { data: listingData, error } = await supabase
      .from('listings')
      .insert({
        id: cuid(),
        userId: req.user!.userId,
        title,
        description,
        price: parseFloat(price),
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrls: imageUrls,
        contactMethod: contactMethod,
        bedrooms,
        bathrooms,
        school: school || null,
        petsAllowed: petsAllowed === 'true',
        laundryInBuilding: laundryInBuilding === 'true',
        parkingAvailable: parkingAvailable === 'true',
        airConditioning: airConditioning === 'true',
        summary: null, // Will be generated later if needed
        tags: [], // Will be generated later if needed
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .select(`
        *,
        user:users(id, name, email)
      `);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      message: 'Listing created successfully',
      listing: listingData[0]
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
      contactMethod,
      bedrooms,
      bathrooms,
      school,
      petsAllowed,
      laundryInBuilding,
      parkingAvailable,
      airConditioning
    } = req.body;

    // Check if listing exists and user owns it
    const { data: existingListing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    // Handle image uploads
    let imageUrls = existingListing.imageUrls;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImageUrls: string[] = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;
        const fileName = `${Date.now()}-${i}-${file.originalname}`;
        const imageUrl = await uploadImage(file.buffer, fileName);
        newImageUrls.push(imageUrl);
      }
      imageUrls = newImageUrls;
    }

    // Update listing
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update({
        title,
        description,
        price: parseFloat(price),
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrls: imageUrls,
        contactMethod: contactMethod,
        bedrooms,
        bathrooms,
        school: school || null,
        petsAllowed: petsAllowed === 'true',
        laundryInBuilding: laundryInBuilding === 'true',
        parkingAvailable: parkingAvailable === 'true',
        airConditioning: airConditioning === 'true',
        updatedAt: new Date()
      })
      .eq('id', id)
      .select(`
        *,
        user:users(id, name, email)
      `);

    if (updateError) {
      console.error('Supabase error:', updateError);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing[0]
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
    const { data: existingListing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    // Delete images from storage
    for (const imageUrl of existingListing.imageUrls) {
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
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Supabase error:', deleteError);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's listings
router.get('/user/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        *,
        likes:likes(count),
        messages:messages(count),
        offers:offers(count)
      `)
      .eq('userId', req.user!.userId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ listings });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;