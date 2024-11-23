import React from 'react';
import html2canvas from 'html2canvas';
import { FaCamera } from 'react-icons/fa';

const ScreenshotButton: React.FC<{ targetRef: React.RefObject<HTMLDivElement> }> = ({ targetRef }) => {
    const takeScreenshot = async () => {
        if (targetRef.current) {
            const canvas = await html2canvas(targetRef.current, { scale: 2 });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'screenshot.png';
            link.click();
        }
    };

    return (
        <button onClick={takeScreenshot} style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center' }}>
            <FaCamera size={24} style={{ marginRight: '0.5rem' }} />
            Take Screenshot
        </button>
    );
};

export default ScreenshotButton;