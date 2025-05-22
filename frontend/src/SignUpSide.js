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

export default function SignUpSide() {
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
                        <Typography component="h1" variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                            Sign up for OptiRoom
                        </Typography>

                        {/* FORM STARTS HERE */}
                        <Box
                            component="form"
                            noValidate
                            sx={{
                                width: "100%",         // Ensure uniform width
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,              // Vertical spacing between inputs
                            }}
                        >
                            <TextField
                                required
                                label="First Name"
                                autoComplete="given-name"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                required
                                label="Last Name"
                                autoComplete="family-name"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                required
                                label="Email Address"
                                autoComplete="email"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                required
                                label="Password"
                                type="password"
                                autoComplete="new-password"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                required
                                label="Confirm Password"
                                type="password"
                                autoComplete="new-password"
                                size="small"
                                fullWidth
                            />

                            <Button
                                type="submit"
                                fullWidth
                                size="large"
                                variant="contained"
                                disableElevation
                                sx={{
                                    mt: 1.5,
                                    fontWeight: "bold",
                                    backgroundColor: "#333",
                                    textTransform: "none",
                                    boxShadow: "none",
                                    "&:hover": {
                                        backgroundColor: "#222",
                                        boxShadow: "none",
                                    },
                                }}
                            >
                                Sign Up
                            </Button>

                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                Already have an account?{" "}
                                <Link href="/" underline="hover">
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                        {/* FORM ENDS HERE */}

                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
