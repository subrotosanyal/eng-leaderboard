// themeUtils.ts
export const applyTheme = (theme: 'light' | 'dark' | 'system'): void => {
    const root = document.documentElement;
    const isDarkMode =
        theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.remove('light', 'dark');
    root.classList.add(isDarkMode ? 'dark' : 'light');
};
