import React, { useState } from "react";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Grid,
    Box,
    Typography,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    InputAdornment,
    Link,
    createTheme,
    ThemeProvider,
    styled,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const theme = createTheme();

const Paper = styled("div")(({ theme }) => ({
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
}));

const Form = styled("form")(({ theme }) => ({
    width: "100%",
    marginTop: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(3, 0, 2),
}));

export default function SignUp() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        allowExtraEmails: false,
    });

    // State to toggle visibility for both password fields.
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // State for showing the success popup on successful registration.
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

    // State for email existence. If true, show error helper text on email field.
    const [emailExists, setEmailExists] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // If the email field is modified, clear prior "already registered" error.
        if (name === "email") {
            setEmailExists(false);
        }
    };

    // Regular expression for email format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regular expression for password format: at least 8 characters, at least one letter and one number.
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const emailIsValid = emailRegex.test(formData.email);
    const passwordIsValid = passwordRegex.test(formData.password);
    const passwordsMatch = formData.password === formData.confirmPassword;

    // The form is valid if:
    // - All required fields (firstName, lastName, email, password, confirmPassword) are non-empty.
    // - The email is in valid format and is not already registered.
    // - The password meets the format.
    // - The confirm password matches the password.
    const isFormValid =
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        formData.email.trim() !== "" &&
        emailIsValid &&
        !emailExists &&
        formData.password.trim() !== "" &&
        passwordIsValid &&
        formData.confirmPassword.trim() !== "" &&
        passwordsMatch;

    // Optional: Check if email is already registered onBlur of the email field.
    const checkEmailRegistered = async () => {
        const email = formData.email.trim();
        if (email === "") {
            setEmailExists(false);
            return;
        }
        // Only check if the email is in valid format
        if (!emailRegex.test(email)) {
            setEmailExists(false);
            return;
        }
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/check-email?email=${encodeURIComponent(
                    email
                )}`
            );
            const data = await response.json();
            if (response.ok) {
                // If data.available is false, the email is already registered.
                setEmailExists(data.available === false);
            } else {
                setEmailExists(false);
            }
        } catch (error) {
            console.error("Error checking email:", error);
            setEmailExists(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );
            if (response.ok) {
                // Open the success popup dialog.
                setOpenSuccessDialog(true);
            } else {
                const data = await response.json();
                // Instead of displaying an alert for "Email already registered",
                // set the emailExists state so the email field shows the helper text.
                if (data.message === "Email already registered") {
                    setEmailExists(true);
                } else {
                    alert(`Signup failed: ${data.message || "Unknown error"}`);
                }
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    // When the user clicks OK on the popup, close it and navigate to the login page.
    const handleDialogOk = () => {
        setOpenSuccessDialog(false);
        window.location.href = "/"; 
    }

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Paper>
                    <StyledAvatar>
                        <LockOutlinedIcon />
                    </StyledAvatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    sx={{ flexGrow: 1 }}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                    sx={{ flexGrow: 1 }}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </Box>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={checkEmailRegistered}
                                error={
                                    formData.email.trim() !== "" &&
                                    (!emailIsValid || emailExists)
                                }
                                helperText={
                                    formData.email.trim() !== ""
                                        ? !emailIsValid
                                            ? "Please enter a valid email address."
                                            : emailExists
                                                ? "Email is already registered."
                                                : ""
                                        : ""
                                }
                            />
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                error={
                                    formData.password.trim() !== "" && !passwordIsValid
                                }
                                helperText={
                                    formData.password.trim() !== "" && !passwordIsValid
                                        ? "Password must be at least 8 characters with at least one letter and one number."
                                        : ""
                                }
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={togglePasswordVisibility}
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={
                                    formData.confirmPassword.trim() !== "" && !passwordsMatch
                                }
                                helperText={
                                    formData.confirmPassword.trim() !== "" && !passwordsMatch
                                        ? "Passwords do not match."
                                        : ""
                                }
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={togglePasswordVisibility}
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <SubmitButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!isFormValid}
                        >
                            Sign Up
                        </SubmitButton>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Form>
                </Paper>
            </Container>

            {/* Success Popup Dialog */}
            <Dialog open={openSuccessDialog} onClose={handleDialogOk}>
                <DialogTitle>Registration Successful</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Your account has been registered successfully.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogOk} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
