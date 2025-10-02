import { useSettingsStore } from '@/store/useSettingsStore';
import React from 'react';


const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useSettingsStore();

    return (
        <div>
            <p>Current Theme: {theme}</p>
            <button onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
        </div>
    );
};

export default ThemeToggle;