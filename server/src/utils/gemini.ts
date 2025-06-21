import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('Missing required environment variable: GEMINI_API_KEY must be set');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

export const generateCompatibilityRating = async (
seekerProfile: {
  budget: number;
  durationMonths: number;
  profileComment: string;
  distance: number;
},
listing:{
  distance: number;
  price: number;
  durationMonths: number;
  listingComment: string;
}): Promise<number> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are a rental compatibility evaluator.

A person is looking for a sublet. Below is their profile and a listing.
Rate how compatible the listing is with the person's profile **on a scale from 0.0 to 10.0**.

- 10.0 = perfect match
- 0.0 = completely incompatible

Take into account:
- Budget vs price
- Duration fit
- Any specific needs listed

ONLY return a number with **1 decimal place** (e.g., 8.7). No explanations.

Profile:{
  "budget": ${seekerProfile.budget},
  "durationMonths": ${seekerProfile.durationMonths},
  "profileComment": "${seekerProfile.profileComment}",
  }

  Listing:{
  "distance": ${listing.distance}km,
  "price": ${listing.price},
  "durationMonths": ${listing.durationMonths},
  "listingComment": "${listing.listingComment}"
  }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const jsonMatch = text.match(/(\d+(\.\d)?)/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    return parseFloat(jsonMatch[1]);
  } catch (error) {
    console.error('Error generating listing rating:', error);
    return -1;
  }
}; 