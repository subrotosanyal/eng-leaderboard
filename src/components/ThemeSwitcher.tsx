// ThemeSwitcher.tsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center space-x-2">
            <button onClick={() => setTheme('light')} className={theme === 'light' ? 'font-bold' : ''}>Light</button>
            <button onClick={() => setTheme('dark')} className={theme === 'dark' ? 'font-bold' : ''}>Dark</button>
            <button onClick={() => setTheme('system')} className={theme === 'system' ? 'font-bold' : ''}>System</button>
        </div>
    );
};

export default ThemeSwitcher;
