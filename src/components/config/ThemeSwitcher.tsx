import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import {commonStyle} from "../styles/commonStyles.ts";

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-x-1" style={commonStyle}>
            <button onClick={() => setTheme('light')} className={theme === 'light' ? 'font-bold' : ''}>
                <FaSun className="w-6 h-6" />
            </button>
            <button onClick={() => setTheme('dark')} className={theme === 'dark' ? 'font-bold' : ''}>
                <FaMoon className="w-6 h-6" />
            </button>
            <button onClick={() => setTheme('system')} className={theme === 'system' ? 'font-bold' : ''}>
                <FaDesktop className="w-6 h-6" />
            </button>
        </div>
    );
};

export default ThemeSwitcher;