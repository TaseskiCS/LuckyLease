import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModelId = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash';

if (!geminiApiKey) {
  throw new Error('Missing required environment variable: GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

type SeekerProfile = {
  budget: number;
  durationMonths: number;
  profileComment: string;
  distance: number;
};

type Listing = {
  distance: number;
  price: number;
  durationMonths: number;
  listingComment: string;
};

export const generateCompatibilityRating = async (
  seekerProfile: SeekerProfile,
  listing: Listing
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: geminiModelId });

    const prompt = `
You are a rental compatibility evaluator.

A person is looking for a sublet. Below is their profile and a listing.

Your job is to provide an **insightful analysis** in the form of a **"Pros and Cons" list** about how compatible this listing is with the person's profile.

Provide a maximum of 3 Pros and 3 Cons, focusing on the most relevant aspects of the profile and listing.

Use informal language and be concise; as this pros and cons is going to the Sublease Seeker. Avoid generic statements and focus on specific details from the profile and listing.


Pros:
- ...
- ...

Cons:
- ...
- ...

Focus on:
- Budget vs price
- Duration match
- Distance
- Profile and listing comments

Rate how compatible the listing is with the person's profile **on a scale from 0.0 to 10.0**.

After the pros and cons, provide a **compatibility rating** based on the following scale:
- 10.0 = perfect match
- 0.0 = completely incompatible
return a number with **1 decimal place** (e.g., 8.7).
- Use a leprechaun-themed twist strictly when giving the number rating, not for the pro and cons list but keep it to a single line.

Make sure the aswers are appropriate for a professional website. No profanity or inappropriate content.

Profile:
{
  "budget": ${seekerProfile.budget},
  "durationMonths": ${seekerProfile.durationMonths},
  "profileComment": "${seekerProfile.profileComment}"
}

Listing:
{
  "distance": ${listing.distance}km,
  "price": ${listing.price},
  "durationMonths": ${listing.durationMonths},
  "listingComment": "${listing.listingComment}"
}
    `.trim();

    const result = await model.generateContent(prompt);
    const responseText = (await result.response.text()).trim();

    // Basic sanity check (optional)
    if (!responseText.includes('Pros:') || !responseText.includes('Cons:')) {
      throw new Error(`Unexpected response format from Gemini:\n${responseText}`);
    }

    return responseText;
  } catch (error) {
    console.error('Error generating compatibility analysis:', error);
    return 'Error generating analysis. Please try again later.';
  }
};
