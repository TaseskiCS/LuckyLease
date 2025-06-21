import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('Missing required environment variable: GEMINI_API_KEY must be set');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

export const generateListingSummary = async (title: string, description: string, price: number, location: string): Promise<{ summary: string; tags: string[] }> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Create a concise summary and relevant tags for this sublet listing:
      
      Title: ${title}
      Description: ${description}
      Price: $${price}
      Location: ${location}
      
      Please provide:
      1. A 2-3 sentence summary that highlights the key features and benefits
      2. 5-8 relevant tags (single words or short phrases) that would help people find this listing
      
      Format your response as JSON:
      {
        "summary": "your summary here",
        "tags": ["tag1", "tag2", "tag3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      summary: parsed.summary || 'No summary available',
      tags: parsed.tags || []
    };
  } catch (error) {
    console.error('Error generating listing summary:', error);
    return {
      summary: 'Summary not available',
      tags: []
    };
  }
}; 