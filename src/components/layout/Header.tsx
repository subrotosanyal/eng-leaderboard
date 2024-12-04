import React from 'react';
import { commonStyle } from '../styles/commonStyles';
import MockDataStrip from './MockDataStrip';
import { useAppSelector } from '../../store/hooks';
import { selectIsMockData } from '../../store/mockDataSlice';

const Header: React.FC = () => {
    const isMockData = useAppSelector(selectIsMockData);

    return (
        <>
            <header className="p-4 shadow" style={{ ...commonStyle, backgroundColor: 'var(--header-bg)' }}>
                <h1 className="text-2xl font-bold">Engineering Dashboard</h1>
            </header>
            <MockDataStrip isMockData={isMockData} />
        </>
    );
};

export default Header;