import React from 'react';
import { commonStyle } from '../styles/commonStyles';

const Header: React.FC = () => {
    return (
        <header className="p-4 shadow" style={{ ...commonStyle, backgroundColor: 'var(--header-bg)' }}>
            <h1 className="text-2xl font-bold">Engineering Dashboard</h1>
        </header>
    );
};

export default Header;