import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import dotenv from "dotenv";
dotenv.config();


// Create JWT token
// console.log("JWT_SECRET is:", process.env.JWT_SECRET);
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: 3 * 24 * 60 * 60, // 3 days
    });
};

// =======================
// REGISTER USER
// =======================
const registerUser = async (req, res) => {
    let { name, email, password } = req.body;

    try {
        // Normalize email
        email = validator.normalizeEmail(email);

        // Validate inputs
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = createToken(newUser._id);
        res.status(201).json({ user: newUser, token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =======================
// LOGIN USER
// =======================
const loginUser = async (req, res) => {
    let { email, password } = req.body;

    try {
        // Normalize email
        email = validator.normalizeEmail(email);

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        res.status(200).json({ user, token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =======================
// GET USER INFO
// =======================
const getUser = async (req, res) => {
    const id = req.user.id;
    try {
        const user = await userModel.findById(id).select("-password"); // exclude password
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { registerUser, loginUser, getUser };
