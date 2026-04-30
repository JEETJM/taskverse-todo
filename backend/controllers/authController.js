import jwt from "jsonwebtoken";
import streamifier from "streamifier";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

const userResponse = (user, token) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    about: user.about,
    token
  };
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const token = generateToken(user._id);

    res.status(201).json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      return res.status(200).json(userResponse(user, token));
    }

    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.about = about || "MERN Stack Learner";

    const updatedUser = await user.save();

    const token = req.headers.authorization.split(" ")[1];

    res.status(200).json(userResponse(updatedUser, token));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "taskverse_profiles",
            transformation: [
              {
                width: 400,
                height: 400,
                crop: "fill",
                gravity: "face"
              }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary();

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = result.secure_url;

    const updatedUser = await user.save();

    const token = req.headers.authorization.split(" ")[1];

    res.status(200).json(userResponse(updatedUser, token));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};