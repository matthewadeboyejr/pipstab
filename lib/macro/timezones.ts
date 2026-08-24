/**
 * Institutional Trading Timezones & Helper Utilities
 */

export interface TimezoneOption {
    id: string; // IANA timezone string e.g. 'America/New_York'
    label: string; // User-friendly label e.g. 'New York (EDT/EST)'
    city: string;
    region: string;
    offsetHours?: number;
}

export const POPULAR_TIMEZONES: TimezoneOption[] = [
    { id: "LOCAL", label: "Local Time (Auto-Detected)", city: "Auto", region: "Local" },
    { id: "UTC", label: "UTC (GMT +00:00)", city: "London/UTC", region: "Global" },
    { id: "America/New_York", label: "New York (EST/EDT, GMT-4)", city: "New York", region: "North America" },
    { id: "Europe/London", label: "London (GMT/BST, GMT+1)", city: "London", region: "Europe" },
    { id: "Africa/Lagos", label: "Lagos / West Africa (WAT, GMT+1)", city: "Lagos", region: "Africa" },
    { id: "Europe/Frankfurt", label: "Frankfurt / Paris (CET/CEST, GMT+2)", city: "Frankfurt", region: "Europe" },
    { id: "Asia/Dubai", label: "Dubai (GST, GMT+4)", city: "Dubai", region: "Middle East" },
    { id: "Asia/Singapore", label: "Singapore / Hong Kong (SGT, GMT+8)", city: "Singapore", region: "Asia" },
    { id: "Asia/Tokyo", label: "Tokyo (JST, GMT+9)", city: "Tokyo", region: "Asia" },
    { id: "Australia/Sydney", label: "Sydney (AEST/AEDT, GMT+10)", city: "Sydney", region: "Oceania" },
    { id: "Pacific/Auckland", label: "Auckland (NZST/NZDT, GMT+12)", city: "Auckland", region: "Oceania" },
    { id: "America/Chicago", label: "Chicago (CST/CDT, GMT-5)", city: "Chicago", region: "North America" },
    { id: "America/Los_Angeles", label: "Los Angeles (PST/PDT, GMT-7)", city: "Los Angeles", region: "North America" },
];

export function getClientTimezone(): string {
    if (typeof window === "undefined") return "UTC";
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
        return "UTC";
    }
}

export function formatTimeInTz(isoDateStr: string, timeZone: string): string {
    try {
        const d = new Date(isoDateStr);
        if (isNaN(d.getTime())) return isoDateStr;
        const activeTz = timeZone === "LOCAL" ? getClientTimezone() : timeZone;

        return new Intl.DateTimeFormat("en-GB", {
            timeZone: activeTz,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(d);
    } catch (e) {
        return isoDateStr;
    }
}

export function getDatePartInTz(isoDateStr: string, timeZone: string): string {
    try {
        const d = new Date(isoDateStr);
        if (isNaN(d.getTime())) return isoDateStr.split("T")[0];
        const activeTz = timeZone === "LOCAL" ? getClientTimezone() : timeZone;

        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: activeTz,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(d);

        const y = parts.find((p) => p.type === "year")?.value;
        const m = parts.find((p) => p.type === "month")?.value;
        const day = parts.find((p) => p.type === "day")?.value;

        return `${y}-${m}-${day}`;
    } catch (e) {
        return isoDateStr.split("T")[0];
    }
}

export function getShortTzAbbreviation(timeZone: string): string {
    try {
        const activeTz = timeZone === "LOCAL" ? getClientTimezone() : timeZone;
        const d = new Date();
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: activeTz,
            timeZoneName: "short",
        }).formatToParts(d);
        return parts.find((p) => p.type === "timeZoneName")?.value || activeTz.split("/").pop() || activeTz;
    } catch {
        return timeZone;
    }
}
