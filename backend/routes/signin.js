const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Import your User model
const User = require("../models/user");

// POST /api/signin endpoint to handle sign in requests
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Attempt to find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            // The user doesn't exist in the database.
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare provided password with stored hashed password.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // The password is incorrect.
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create a JWT token that expires in 1 hour.
        // Ensure you set a secret in your environment variables (e.g., process.env.JWT_SECRET)
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || "default_secret", // Change default before production!
            { expiresIn: "1h" }
        );

        // Return the token as a response.
        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error during sign in:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
