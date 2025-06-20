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
    IconButton,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function SignUpSide() {
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
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$]{8,}$/;

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
                            onSubmit={handleSubmit}
                            sx={{
                                width: "100%",         // Ensure uniform width
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,              // Vertical spacing between inputs
                            }}
                        >
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
                            <TextField
                                rvariant="outlined"
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

                            <Button
                                type="submit"
                                fullWidth
                                size="large"
                                variant="contained"
                                disabled={!isFormValid}
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
        </Box>
    );
}
