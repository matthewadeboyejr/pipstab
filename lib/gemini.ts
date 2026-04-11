import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client
// The SDK can automatically use the GEMINI_API_KEY environment variable if available,
// but we'll explicitly pass it from process.env for better control in Next.js
export const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

/**
 * Validates if the GenAI client is properly configured with an API key
 */
export const isConfigured = !!process.env.GEMINI_API_KEY;

/**
 * Common model names for easy reference
 */
export const MODELS = {
    FLASH: "gemini-2.0-flash",
    PRO: "gemini-2.0-pro",
};

/**
 * Helper to generate text content using the Flash model
 */
export async function generateText(prompt: string, systemInstruction?: string) {
    try {
        const response = await genAI.models.generateContent({
            model: MODELS.FLASH,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text || "";
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
}
