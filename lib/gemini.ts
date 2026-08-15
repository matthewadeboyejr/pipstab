import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client
export const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

export const isConfigured = !!process.env.GEMINI_API_KEY;

export const MODELS = {
    FLASH: "gemini-3.6-flash",
    PRO: "gemini-3.1-pro-preview",
};

// Priority cascade of models for automatic 503 / 429 / 500 fallback
export const FALLBACK_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.1-pro-preview",
];

interface GenerateWithFallbackOptions {
    contents: any;
    config?: any;
    primaryModel?: string;
    fallbackList?: string[];
    maxRetriesPerModel?: number;
}

/**
 * Executes a Gemini request with automatic multi-model failover and backoff.
 * If a model returns 503 (high demand / unavailable), 429 (rate limit), or 500,
 * it immediately fails over to the next resilient model in the chain.
 */
export async function generateContentWithFallback(options: GenerateWithFallbackOptions) {
    const primary = options.primaryModel || MODELS.FLASH;
    const modelChain = [
        primary,
        ...(options.fallbackList || FALLBACK_MODELS).filter((m) => m !== primary),
    ];

    let lastError: any = null;

    for (const model of modelChain) {
        try {
            const response = await genAI.models.generateContent({
                model,
                contents: options.contents,
                config: options.config,
            });

            if (response && (response.text || (response as any).candidates)) {
                return {
                    response,
                    text: response.text || "",
                    usedModel: model,
                };
            }
        } catch (error: any) {
            lastError = error;
            const errorMsg = error?.message || String(error);
            const isDemandOrRateLimit =
                errorMsg.includes("503") ||
                errorMsg.includes("429") ||
                errorMsg.includes("high demand") ||
                errorMsg.includes("UNAVAILABLE") ||
                errorMsg.includes("RESOURCE_EXHAUSTED") ||
                errorMsg.includes("NOT_FOUND") ||
                errorMsg.includes("404");

            console.warn(
                `[Gemini Failover] Model ${model} failed (${error?.status || "error"}). Falling over to next model... Details:`,
                errorMsg.slice(0, 120)
            );

            // Brief pause before trying the next model
            await new Promise((resolve) => setTimeout(resolve, 300));
        }
    }

    throw lastError || new Error("All Gemini fallback models exhausted");
}

/**
 * Helper to generate text content using the resilient failover chain
 */
export async function generateText(prompt: string, systemInstruction?: string) {
    try {
        const result = await generateContentWithFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return result.text;
    } catch (error) {
        console.error("Gemini Error across all fallback models:", error);
        throw error;
    }
}
