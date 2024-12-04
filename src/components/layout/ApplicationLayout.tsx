import React, { useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { commonStyle } from '../styles/commonStyles';
import SidePanel from './SidePanel';
import Header from './Header';
import Footer from './Footer';

interface ApplicationLayoutProps {
    children: React.ReactNode;
    setIsMockData?: (isMock: boolean) => void;
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({ children}) => {
    const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
    const { theme } = useTheme();
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div className={`flex flex-col md:flex-row min-h-screen ${theme}`} style={commonStyle}>
            <SidePanel
                isMenuCollapsed={isMenuCollapsed}
                setIsMenuCollapsed={setIsMenuCollapsed}
                targetRef={contentRef}
            />
            <main className="flex-1 flex flex-col" style={commonStyle}>
                <Header />
                <div className="flex-1 p-4" style={commonStyle} ref={contentRef}>
                    {children}
                </div>
                <Footer/>
            </main>
        </div>
    );
};

export default ApplicationLayout;