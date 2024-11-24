import React from 'react';
import html2canvas from 'html2canvas';
import { FaCamera } from 'react-icons/fa';
import { commonStyle } from '../styles/commonStyles.ts';

interface ScreenshotButtonProps {
    targetRef: React.RefObject<HTMLDivElement>;
    isMenuCollapsed?: boolean;
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ targetRef, isMenuCollapsed }) => {
    const takeScreenshot = async () => {
        if (targetRef.current) {
            try {
                const canvas = await html2canvas(targetRef.current, {
                    scale: 2,
                    useCORS: true,
                    onClone: (documentClone: Document) => {
                        const images = documentClone.getElementsByTagName('img');
                        for (let i = 0; i < images.length; i++) {
                            images[i].crossOrigin = 'anonymous';
                        }
                    }
                });
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'screenshot.png';
                link.click();
            } catch (error) {
                console.error('Error taking screenshot:', error);
            }
        }
    };

    return (
        <button onClick={takeScreenshot} style={commonStyle} className="flex items-center space-x-2">
            <FaCamera size={24} />
            {!isMenuCollapsed && <span>Screenshot</span>}
        </button>
    );
};

export default ScreenshotButton;