import { NextResponse } from "next/server";

export async function GET() {
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

    if (!FINNHUB_API_KEY) {
        return NextResponse.json(
            { error: "Finnhub API key not configured" },
            { status: 500 }
        );
    }

    try {
        // Fetch global market news from Finnhub
        const response = await fetch(
            `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`,
            { next: { revalidate: 300 } } // Cache for 5 minutes
        );

        if (!response.ok) {
            throw new Error(`Finnhub API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Return only the most recent 30 news items
        return NextResponse.json(data.slice(0, 30));
    } catch (error: any) {
        console.error("News API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch news" },
            { status: 500 }
        );
    }
}
