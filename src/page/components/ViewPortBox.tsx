import Box from '@mui/material/Box';
import { useState, useEffect, ReactNode, FC } from 'react';

export const useViewportSize = () => {
    const [viewportSize, setViewportSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setViewportSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return viewportSize;
};

export const ViewPortBox: FC<{ children: ReactNode }> = ({ children }) => {
    const viewPortSize = useViewportSize()
    return <Box
        height={`${viewPortSize.height}px`}
        width={`${viewPortSize.width}px`}
    >
        {children}
    </Box>
}