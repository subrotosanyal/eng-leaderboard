import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBars, FaTimes, FaChartBar, FaCog } from 'react-icons/fa';
import { commonStyle } from '../styles/commonStyles';

interface SidePanelProps {
    isMenuCollapsed: boolean;
    setIsMenuCollapsed: (collapsed: boolean) => void;
    setIsConfigDialogOpen: (open: boolean) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ isMenuCollapsed, setIsMenuCollapsed, setIsConfigDialogOpen }) => {
    const navigate = useNavigate();

    return (
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
    );
};

export default SidePanel;