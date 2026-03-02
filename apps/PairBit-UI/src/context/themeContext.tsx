import React, { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
type ThemeMode = "light" | "dark";

interface ColorPalette {
    background: string;
    foreground: string;
    accent: string;
    border: string;
    text: string;
    secondary: string;
}

interface ThemeContextType {
    mode: ThemeMode;
    palette: ColorPalette;
    toggleTheme: () => void;
}

const lightPalette: ColorPalette = {
    background: "#f5f7fa",
    foreground: "#ffffff",
    accent: "#873df7",
    border: "#e0e6ed",
    text: "#23283a",
    secondary: "#b0b8c1",
};

const darkPalette: ColorPalette = {
    background: "#181c24",
    foreground: "#23283a",
    accent: "#00e6fe",
    border: "#23283a",
    text: "#f5f7fa",
    secondary: "#b0b8c1",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    // Detect system preference on first load
    const getInitialMode = (): ThemeMode => {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    };
    const [mode, setMode] = useState<ThemeMode>(getInitialMode);

    // Listen for system theme changes
    React.useEffect(() => {
        if (typeof window !== "undefined" && window.matchMedia) {
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = (e: MediaQueryListEvent) => setMode(e.matches ? "dark" : "light");
            mq.addEventListener("change", handler);
            return () => mq.removeEventListener("change", handler);
        }
    }, []);

    const toggleTheme = () => setMode((prev) => (prev === "dark" ? "light" : "dark"));

    const palette = useMemo(() => (mode === "dark" ? darkPalette : lightPalette), [mode]);

    // Optionally, set CSS variables for palette
    React.useEffect(() => {
        const root = document.documentElement;
        Object.entries(palette).forEach(([key, value]) => {
            root.style.setProperty(`--theme-${key}`, value);
        });
    }, [palette]);

    return (
        <ThemeContext.Provider value={{ mode, palette, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}