import Papa from 'papaparse';
import { LogTradeFormValues } from '@/schemas/logTradeSchema';

// Standardized Trade format returned by parser
export interface ParsedTrade {
    ticket: string; // The order ID from the broker to prevent duplicates
    pair: string;
    direction: "LONG" | "SHORT";
    date: string; // YYYY-MM-DD
    entry_price: number | null;
    exit_price: number | null;
    sl: number | null;
    lot_size: number | null;
    pnl: number;
    // Defaulted properties
    session: string;
    setup: string;
    emotion: string;
    notes: string;
}

export const parseTradeFile = async (file: File): Promise<ParsedTrade[]> => {
    return new Promise((resolve, reject) => {
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'html' || ext === 'htm') {
            parseHTMLReport(file).then(resolve).catch(reject);
        } else if (ext === 'csv') {
            parseCSVReport(file).then(resolve).catch(reject);
        } else {
            reject(new Error("Unsupported file format. Please upload a .csv or .html file."));
        }
    });
};

const parseHTMLReport = (file: File): Promise<ParsedTrade[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "text/html");

                // Basic MT4/5 HTML Report extraction logic
                // Usually MT4/5 renders tables with rows of trades.
                // You look for rows that resemble trades. 
                // A very robust parser would handle MT4 and MT5 distinct table structures.
                // For this demo, let's just scrape tr elements dynamically looking for common data.
                
                const rows = doc.querySelectorAll('tr');
                const parsedTrades: ParsedTrade[] = [];

                rows.forEach((row) => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 10) return; // Not a trade row

                    // Very naive MT4 heuristic check:
                    // Typical MT4 order: Ticket, Open Time, Type, Size, Item, Price, S/L, T/P, Close Time, Price, Commission, Taxes, Swap, Profit
                    
                    const ticketText = cells[0].textContent?.trim();
                    const typeText = cells[2].textContent?.trim().toLowerCase();
                    
                    // Proceed only if type is 'buy' or 'sell' and ticket is numeric
                    if (ticketText && !isNaN(Number(ticketText)) && (typeText === 'buy' || typeText === 'sell')) {
                        const dateText = cells[1].textContent?.trim();         // e.g. 2023.10.15 14:00:00
                        const lotText = cells[3].textContent?.trim();
                        const pairText = cells[4].textContent?.trim();
                        const entryPriceText = cells[5].textContent?.trim();
                        const slText = cells[6].textContent?.trim();
                        // Exit price usually column 9 in MT4, Profit in column 13
                        const exitPriceText = cells[9].textContent?.trim();
                        const profitText = cells[cells.length - 1].textContent?.trim();

                        if (ticketText && pairText && profitText !== undefined) {
                            parsedTrades.push({
                                ticket: ticketText,
                                pair: pairText.replace(/[^A-Za-z0-9]/g, '').toUpperCase(), // Normalize e.g. EURUSD
                                direction: typeText === 'buy' ? "LONG" : "SHORT",
                                date: parseDateStr(dateText || ""),
                                entry_price: parseFloat(entryPriceText || "0") || null,
                                exit_price: parseFloat(exitPriceText || "0") || null,
                                sl: parseFloat(slText || "0") || null,
                                lot_size: parseFloat(lotText || "0") || null,
                                pnl: parseFloat(profitText.replace(/ /g, '') || "0"),
                                session: "London/NY Overlap", // Default
                                setup: "Imported",            // Default
                                emotion: "Neutral",           // Default
                                notes: "Imported from MT4/5 HTML Report."
                            });
                        }
                    }
                });

                resolve(parsedTrades);
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsText(file);
    });
}

const parseCSVReport = (file: File): Promise<ParsedTrade[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const parsedTrades: ParsedTrade[] = [];

                    results.data.forEach((row: any) => {
                        // Generic matching for various CSV headers
                        const ticket = row['Ticket'] || row['Order'] || row['ID'] || row['Position ID'];
                        const pair = row['Symbol'] || row['Item'] || row['Pair'] || row['Instrument'];
                        const type = (row['Type'] || row['Action'] || row['Direction'] || "").toLowerCase();
                        
                        const dateStr = row['Time'] || row['Open Time'] || row['Date'] || row['Time (close)'];
                        
                        const pnl = parseFloat(row['Profit'] || row['P/L'] || row['Net'] || row['Net Profit'] || "0");
                        
                        const lotStr = row['Size'] || row['Volume'] || row['Lot'] || row['Lots'] || "0";
                        const entryPriceVal = parseFloat(row['Price'] || row['Open Price'] || "0");
                        const exitPriceVal = parseFloat(row['Close Price'] || "0");
                        const slVal = parseFloat(row['S/L'] || row['Stop Loss'] || "0");

                        // We consider it a trade if it has a ticket/symbol/profit
                        if (pair && type && (type.includes('buy') || type.includes('long') || type.includes('sell') || type.includes('short'))) {
                            
                            const direction = (type.includes('buy') || type.includes('long')) ? "LONG" : "SHORT";

                            parsedTrades.push({
                                ticket: ticket ? String(ticket).trim() : `IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                pair: pair.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
                                direction: direction,
                                date: parseDateStr(String(dateStr)),
                                entry_price: entryPriceVal || null,
                                exit_price: exitPriceVal || null,
                                sl: slVal || null,
                                lot_size: parseFloat(String(lotStr)) || null,
                                pnl: pnl,
                                session: "London/NY Overlap",
                                setup: "Imported",
                                emotion: "Neutral",
                                notes: "Imported from CSV."
                            });
                        }
                    });

                    resolve(parsedTrades);
                } catch (err) {
                    reject(err);
                }
            },
            error: (err) => {
                reject(err);
            }
        });
    });
}

// Attempt to parse YYYY.MM.DD HH:MM:SS or standard ISO dates
const parseDateStr = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    
    // MT4 format: 2023.10.15 14:00:00 -> replace dots with dashes
    const normalized = dateStr.replace(/\./g, '-');
    
    const dateObj = new Date(normalized);
    if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split("T")[0];
    }
    
    return new Date().toISOString().split("T")[0];
}
