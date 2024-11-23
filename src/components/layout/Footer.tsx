import React from 'react';
import { commonStyle } from '../styles/commonStyles';

const Footer: React.FC = () => {
    return (
        <footer className="p-4 shadow flex justify-end" style={{ ...commonStyle, backgroundColor: 'var(--footer-bg)' }}>
            {/* Footer content */}
        </footer>
    );
};

export default Footer;