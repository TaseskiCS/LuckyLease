import { Router, Request, Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import { authenticateToken } from '../middleware/auth';
import { uploadImage, deleteImage } from '../utils/supabase';
import cuid from 'cuid';
import https from 'https';
import { URL } from 'url';

// Geocoding function using OpenStreetMap Nominatim API with https module
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = new URL(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`);
      
      console.log('Geocoding request URL:', url.toString());
      console.log('Original address:', address);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'User-Agent': 'SpurHack25-Housing-App/1.0',
          'Accept': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        console.log('Geocoding response status:', res.statusCode);
        console.log('Geocoding response headers:', res.headers);
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            console.log('Raw response data:', data);
            
            if (res.statusCode !== 200) {
              console.error('Geocoding API error:', res.statusCode, data);
              resolve(null);
              return;
            }
            
            const parsedData = JSON.parse(data);
            console.log('Parsed geocoding API response:', JSON.stringify(parsedData, null, 2));
            
            if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
              const firstResult = parsedData[0];
              if (firstResult.lat && firstResult.lon) {
                const result = {
                  lat: parseFloat(firstResult.lat),
                  lng: parseFloat(firstResult.lon)
                };
                console.log('Geocoding successful:', result);
                resolve(result);
                return;
              } else {
                console.log('No lat/lon in first result:', firstResult);
              }
            } else {
              console.log('No geocoding results found. Data type:', typeof parsedData, 'Is array:', Array.isArray(parsedData), 'Length:', parsedData?.length);
            }
            
            resolve(null);
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Raw data that failed to parse:', data);
            resolve(null);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Geocoding request error:', error);
        resolve(null);
      });
      
      req.setTimeout(10000, () => {
        console.error('Geocoding request timeout');
        req.destroy();
        resolve(null);
      });
      
      req.end();
    } catch (error) {
      console.error('Geocoding setup error:', error);
      resolve(null);
    }
  });
}

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
  body('petsAllowed').custom((value) => {
    return value === 'true' || value === 'false' || value === true || value === false;
  }),
  body('laundryInBuilding').custom((value) => {
    return value === 'true' || value === 'false' || value === true || value === false;
  }),
  body('parkingAvailable').custom((value) => {
    return value === 'true' || value === 'false' || value === true || value === false;
  }),
  body('airConditioning').custom((value) => {
    return value === 'true' || value === 'false' || value === true || value === false;
  }),
  body('listingType').isIn(['house', 'apartment']),
];

// Get all listings with filters
router.get('/', async (req: Request, res: Response) => {
  try {    const {
      page = '1',
      limit = '20',
      location,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      search,
      listingType
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
    }    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    if (listingType) {
      query = query.eq('listingType', listingType as string);
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
    }    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }
    if (listingType) {
      countQuery = countQuery.eq('listingType', listingType as string);
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
    console.log('Creating listing with data:', req.body);
    console.log('Files received:', req.files?.length || 0);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());      return res.status(400).json({ errors: errors.array() });
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
      airConditioning,
      listingType
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
      }    }
    console.log('Final imageUrls:', imageUrls);

    // Geocode the address to get coordinates
    let geocodedCoordinates = null;
    let geocodingWarning = null;
    
    try {
      geocodedCoordinates = await geocodeAddress(location);
      if (!geocodedCoordinates) {
        geocodingWarning = 'Could not convert address to coordinates. This listing will not appear on the map.';
        console.warn('Geocoding failed for address:', location);
      }
    } catch (geocodingError) {
      console.error('Geocoding error:', geocodingError);
      geocodingWarning = 'Could not convert address to coordinates. This listing will not appear on the map.';
    }    // Convert boolean strings to actual booleans
    const convertToBoolean = (value: any): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return false;
    };

    // Create listing
    console.log('About to insert listing with coordinates:', geocodedCoordinates);
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
        petsAllowed: convertToBoolean(petsAllowed),
        laundryInBuilding: convertToBoolean(laundryInBuilding),
        parkingAvailable: convertToBoolean(parkingAvailable),
        airConditioning: convertToBoolean(airConditioning),
        coordinates: geocodedCoordinates,
        listingType,
        summary: null, // Will be generated later if needed
        tags: [], // Will be generated later if needed
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .select(`
        *,
        user:users(id, name, email)
      `);    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Database error',
        details: error.message || 'Unknown database error'
      });
    }

    console.log('Listing created successfully:', listingData[0]);
    res.status(201).json({
      message: 'Listing created successfully',
      listing: listingData[0],
      warning: geocodingWarning
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
    }    const { id } = req.params;
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
      airConditioning,
      listingType
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
      }      imageUrls = newImageUrls;
    }    // Geocode the address if location has changed
    let geocodedCoordinates = existingListing.coordinates; // Keep existing coordinates by default
    let geocodingWarning = null;
    
    if (location !== existingListing.location) {
      try {
        geocodedCoordinates = await geocodeAddress(location);
        if (!geocodedCoordinates) {
          geocodingWarning = 'Could not convert updated address to coordinates. This listing will not appear on the map.';
          console.warn('Geocoding failed for updated address:', location);
        }
      } catch (geocodingError) {
        console.error('Geocoding error:', geocodingError);
        geocodingWarning = 'Could not convert updated address to coordinates. This listing will not appear on the map.';
      }
    }

    // Convert boolean strings to actual booleans
    const convertToBoolean = (value: any): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return false;
    };

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
        petsAllowed: convertToBoolean(petsAllowed),
        laundryInBuilding: convertToBoolean(laundryInBuilding),
        parkingAvailable: convertToBoolean(parkingAvailable),
        airConditioning: convertToBoolean(airConditioning),
        coordinates: geocodedCoordinates,
        listingType,
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
    }    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing[0],
      warning: geocodingWarning
    });  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate address and get coordinates
router.post('/validate-address', async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    
    console.log('Address validation request:', { address });
    
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      console.log('Invalid address provided:', address);
      return res.status(400).json({ error: 'Address is required' });
    }
    
    console.log('Validating address:', address.trim());
    const coordinates = await geocodeAddress(address.trim());
    console.log('Geocoding result:', coordinates);
    
    if (coordinates) {
      console.log('Address validation successful:', { address: address.trim(), coordinates });
      res.json({
        valid: true,
        coordinates,
        message: 'Address successfully converted to coordinates'
      });
    } else {
      console.log('Address validation failed:', address.trim());
      res.json({
        valid: false,
        coordinates: null,
        message: 'Could not convert address to coordinates. This listing will not appear on the map.'
      });
    }
  } catch (error) {
    console.error('Address validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for direct geocoding testing
router.get('/test-geocoding/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    console.log('Testing geocoding for:', address);
    
    // Test with direct https request
    const encodedAddress = encodeURIComponent(address);
    const testUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=3&addressdetails=1`;
    
    console.log('Test URL:', testUrl);
    
    // Make direct https request for comparison
    const url = new URL(testUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'SpurHack25-Housing-App/1.0',
        'Accept': 'application/json'
      }
    };
    
    const testResult = await new Promise<any>((resolve) => {
      const req = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          try {
            resolve({
              status: response.statusCode,
              data: JSON.parse(data)
            });
          } catch (e) {
            resolve({ status: response.statusCode, data: data, parseError: e });
          }
        });
      });
      req.on('error', (error) => resolve({ error: error.message }));
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({ error: 'Timeout' });
      });
      req.end();
    });
    
    res.json({
      testUrl,
      directApiResult: testResult,
      geocodeResult: await geocodeAddress(address)
    });
  } catch (error) {
    console.error('Test geocoding error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
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