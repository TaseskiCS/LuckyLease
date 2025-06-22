import { Router, Request, Response } from 'express';
import { generateCompatibilityRating } from '../utils/gemini';

const router = Router();

interface LuckyOpinionRequest {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    bedrooms: string;
    bathrooms: string;
    amenities: string[];
    school?: string;
  };
  userProfile?: {
    budget: number;
    durationMonths: number;
    profileComment: string;
    distance: number;
  };
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { listing, userProfile }: LuckyOpinionRequest = req.body;

    if (!listing) {
      return res.status(400).json({ error: 'Listing information is required' });
    }

    // Create a default user profile if none provided
    const defaultProfile = {
      budget: listing.price * 1.2, // 20% above listing price
      durationMonths: 4, // Default semester length
      profileComment: "Looking for a comfortable place to stay during my studies.",
      distance: 2 // Default 2km preference
    };

    const profile = userProfile || defaultProfile;

    // Prepare listing data for Gemini
    const listingForGemini = {
      distance: profile.distance, // Use user's distance preference
      price: listing.price,
      durationMonths: profile.durationMonths,
      listingComment: `${listing.title}. ${listing.description}. Features: ${listing.bedrooms} bed, ${listing.bathrooms} bath. Amenities: ${listing.amenities.join(', ')}. Location: ${listing.location}. ${listing.school ? `Near ${listing.school}` : ''}`
    };

    // Get Lucky's opinion from Gemini
    const opinion = await generateCompatibilityRating(profile, listingForGemini);

    // Extract rating from the opinion text
    const ratingMatch = opinion.match(/(\d+\.\d+)/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

    return res.json({
      success: true,
      opinion: opinion,
      rating: rating,
      listingId: listing.id
    });

  } catch (error) {
    console.error('Error getting Lucky\'s opinion:', error);
    return res.status(500).json({ 
      error: 'Failed to get Lucky\'s opinion. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router; 