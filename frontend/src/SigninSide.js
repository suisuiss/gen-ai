import React, { useState } from "react";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Link,
    Paper,
    Grid,
    Typography,
    createTheme,
    ThemeProvider
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const theme = createTheme();

const Root = styled(Grid)(({ theme }) => ({
    height: "100vh"
}));

const Image = styled(Grid)(({ theme }) => ({
    backgroundImage: "url(https://source.unsplash.com/random)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center"
}));

const PaperWrapper = styled("div")(({ theme }) => ({
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
}));

const StyledForm = styled("form")(({ theme }) => ({
    width: "100%",
    marginTop: theme.spacing(1)
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(3, 0, 2)
}));

const SignInSide = () => {
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
        <ThemeProvider theme={theme}>
            <Root container component="main">
                <CssBaseline />
                <Image item xs={false} sm={4} md={7} />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <PaperWrapper>
                        <StyledAvatar>
                            <LockOutlinedIcon />
                        </StyledAvatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <StyledForm noValidate onSubmit={handleSubmit}>
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
                            <SubmitButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={!email || !password}
                            >
                                Sign In
                            </SubmitButton>
                            <Grid container>
                                <Grid item>
                                    <Link href="/signup" variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </StyledForm>
                    </PaperWrapper>
                </Grid>
            </Root>
        </ThemeProvider>
    );
};

export default SignInSide;
