const express = require("express");
const cors = require('cors');
const router = express.Router();
const User = require("../models/user");

router.post("/signup", async (req, res) => {
    const { firstName, lastName, email, password, allowExtraEmails } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const user = new User({ firstName, lastName, email, password, allowExtraEmails });
        await user.save();

        res.status(201).json({ message: "Signup successful" });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

module.exports = router;
