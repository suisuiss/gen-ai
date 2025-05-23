import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";

export default function SignInSide() {
    const navigate = useNavigate(); // Initialize navigate

    // Controlled fields and error state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage(""); // Clear any previous error

        try {
            const response = await fetch("http://localhost:5001/api/signin", {
                // Ensure URL matches your backend route
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Successfully signed in:", data);
                // Save auth token if needed
                // localStorage.setItem("token", data.token);
                // Navigate to homepage ("/homepage" or your desired home route)
                navigate("/homepage");
            } else {
                const errorData = await response.json();
                console.error("Sign in failed:", errorData);
                setErrorMessage(errorData.message || "Invalid email or password.");
            }
        } catch (error) {
            console.error("Error during sign in:", error);
            setErrorMessage("An error occurred. Please try again.");
        }
    };
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
                        <Box component="form" noValidate sx={{ mt: 2 }} onSubmit={handleSubmit}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={Boolean(errorMessage)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={Boolean(errorMessage)}
                                helperText={errorMessage}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={!email || !password}
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
