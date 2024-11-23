import React, { useState, useEffect, useReducer, useRef } from 'react';
import ConfigDialog from '../config/ConfigDialog';
import { useTheme } from '../../context/ThemeContext';
import { commonStyle } from '../styles/commonStyles';
import { JiraConfig } from '../../types';
import SidePanel from './SidePanel';
import Header from './Header';
import Footer from './Footer';

const ApplicationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
    const [config, setConfig] = useState<JiraConfig | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const { theme } = useTheme();
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const contentRef = useRef<HTMLDivElement>(null);

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
            <SidePanel
                isMenuCollapsed={isMenuCollapsed}
                setIsMenuCollapsed={setIsMenuCollapsed}
                setIsConfigDialogOpen={setIsConfigDialogOpen} targetRef={contentRef}            />
            <main className="flex-1 flex flex-col" style={commonStyle}>
                <Header />
                <div className="flex-1 p-4" key={refreshKey} style={commonStyle} ref={contentRef}>
                    {children}
                </div>
                <Footer/>
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