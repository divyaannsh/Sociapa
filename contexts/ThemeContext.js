"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('sociapa-theme');
        if (stored === 'dark') {
            setIsDark(true);
            document.body.classList.add('dark-mode');
        }
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        if (newDark) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('sociapa-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('sociapa-theme', 'light');
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
}
