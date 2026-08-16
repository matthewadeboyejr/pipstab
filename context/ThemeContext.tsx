"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => { },
});

// Theme selection logic moved to useEffect to prevent hydration mismatch


export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const saved = localStorage.getItem("piptab-theme") as Theme | null;
        if (saved === "light" || saved === "dark") {
            setTheme(saved);
        } else if (!document.documentElement.classList.contains("dark")) {
            setTheme("light");
        }
    }, []);

    // Sync .dark class on <html> whenever theme changes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        try {
            localStorage.setItem("piptab-theme", theme);
        } catch (e) {}
    }, [theme]);

    const toggleTheme = useCallback(
        () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
        []
    );

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
