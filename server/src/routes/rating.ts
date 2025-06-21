// server/routes/rating.ts
import express from 'express';
import { generateCompatibilityRating } from '../utils/gemini'; 

const router = express.Router();

router.post('/', async (req, res) => {
    const { seekerProfile, listing } = req.body;
  
    console.log('Request body:', req.body); // Add this to debug
  
    if (!seekerProfile || !listing) {
      return res.status(400).json({ error: 'Missing seekerProfile or listing in request body' });
    }
  
    try {
      const rating = await generateCompatibilityRating(seekerProfile, listing);
      res.json({ rating });
    } catch (error) {
      console.error('Rating error:', error);
      res.status(500).json({ error: 'Failed to generate rating' });
    }
  });
  

export default router;
