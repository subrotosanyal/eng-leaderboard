import React, { useState, useEffect, useReducer } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBars, FaTimes, FaChartBar, FaCog } from 'react-icons/fa';
import ConfigDialog from './config/ConfigDialog';
import ThemeSwitcher from './config/ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';
import { commonStyle } from './styles/commonStyles';
import { JiraConfig } from '../types';

const ApplicationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
    const [config, setConfig] = useState<JiraConfig | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        const storedConfig = {
            project: localStorage.getItem('jiraProject') || '',
            board: localStorage.getItem('jiraBoard') || '',
            developerField: localStorage.getItem('jiraDeveloperField') ? JSON.parse(localStorage.getItem('jiraDeveloperField')!) : { key: '', name: '' },
            storyPointField: localStorage.getItem('jiraStoryPointField') ? JSON.parse(localStorage.getItem('jiraStoryPointField')!) : { key: '', name: '' },
            testedByField: localStorage.getItem('jiraTestedByField') ? JSON.parse(localStorage.getItem('jiraTestedByField')!) : { key: '', name: '' },
        };
        setConfig(storedConfig);
    }, []);

    const handleConfigSave = (newConfig: JiraConfig) => {
        if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
            setConfig(newConfig);
            setRefreshKey(prevKey => prevKey + 1);
            forceUpdate();
        }
    };

    useEffect(() => {
    }, [refreshKey]);

    return (
        <div className={`flex flex-col md:flex-row min-h-screen ${theme}`} style={commonStyle}>
            <aside className={`text-white ${isMenuCollapsed ? 'w-16' : 'w-64'} transition-width duration-300 md:relative fixed bottom-0 md:bottom-auto md:top-0 left-0`} style={{ ...commonStyle, backgroundColor: 'var(--side-panel-bg)' }}>
                <div className="p-4 flex justify-between items-center" style={commonStyle}>
                    <button onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}>
                        {isMenuCollapsed ? <FaBars size={24} /> : <FaTimes size={24} />}
                    </button>
                </div>
                <nav className="p-4" style={commonStyle}>
                    <ul>
                        <li className="mb-4">
                            <button onClick={() => navigate('/')} className="flex items-center space-x-2" style={commonStyle}>
                                <FaHome size={24} />
                                {!isMenuCollapsed && <span>Home</span>}
                            </button>
                        </li>
                        <li className="mb-4">
                            <Link to="/comparison" className="flex items-center space-x-2" style={commonStyle}>
                                <FaChartBar size={24} />
                                {!isMenuCollapsed && <span>Metric Comparison</span>}
                            </Link>
                        </li>
                        <li className="mb-4">
                            <button onClick={() => setIsConfigDialogOpen(true)} className="flex items-center space-x-2" style={commonStyle}>
                                <FaCog size={24} />
                                {!isMenuCollapsed && <span>Config</span>}
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 flex flex-col" style={commonStyle}>
                <header className="p-4 shadow" style={{ ...commonStyle, backgroundColor: 'var(--header-bg)' }}>
                    <h1 className="text-2xl font-bold">Engineering Dashboard</h1>
                </header>
                <div className="flex-1 p-4" key={refreshKey} style={commonStyle}>
                    {children}
                </div>
                <footer className="p-4 shadow flex justify-end" style={{ ...commonStyle, backgroundColor: 'var(--footer-bg)' }}>
                    <ThemeSwitcher />
                </footer>
            </main>
            <ConfigDialog
                isOpen={isConfigDialogOpen}
                onClose={() => setIsConfigDialogOpen(false)}
                onSave={handleConfigSave}
            />
        </div>
    );
};

export default ApplicationLayout;