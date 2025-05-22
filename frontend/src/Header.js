// Header.js
import React from "react";
import { Box, Typography } from "@mui/material";

export default function Header() {
    return (
        <Box
            sx={{
                px: 4,
                py: 2,
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #e0e0e0",
                backgroundColor: "#ffffff",
            }}
        >
            {/* Replace with your logo path */}
            <img src="/logo.png" alt="OptiRoom logo" style={{ height: 32, marginRight: 12 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                OptiRoom
            </Typography>
        </Box>
    );
}
