import React from "react";
import {
    Avatar,
    Button,
    TextField,
    Typography,
    Box,
    Container,
    Paper,
    Link,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function SignInSide() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f7f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Container maxWidth="xs">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: "#4a6670" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
                            Sign in to OptiRoom
                        </Typography>
                        <Box component="form" noValidate sx={{ mt: 2 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email Address"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    fontWeight: "bold",
                                    backgroundColor: "#333",
                                    "&:hover": {
                                        backgroundColor: "#222",
                                    },
                                }}
                            >
                                Sign In
                            </Button>
                            <Typography variant="body2" align="center">
                                Don’t have an account?{" "}
                                <Link href="/signup" underline="hover">
                                    Sign Up
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
