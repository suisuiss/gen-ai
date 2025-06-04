// Header.js
import React from "react";
import {
    AppBar, Toolbar, Tabs, Tab, Typography
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
    const pages = [
        { label: 'Home', path: '/homepage' },
        { label: 'Schedule', path: '/schedule' },
        { label: 'Room Details', path: '/room-details' },
        { label: 'Floor Plan', path: '/floor-plan' },
    ];

    const navigate = useNavigate();
    const location = useLocation();
    const currentTab = pages.findIndex(p => p.path === location.pathname);

    const handleTabChange = (event, newValue) => {
        navigate(pages[newValue].path);
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: '#1e3a8a' }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    OptiRoom
                </Typography>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    textColor="inherit"
                    indicatorColor="secondary"
                >
                    {pages.map((page, idx) => (
                        <Tab key={idx} label={page.label} />
                    ))}
                </Tabs>
            </Toolbar>
        </AppBar>
    );
}
