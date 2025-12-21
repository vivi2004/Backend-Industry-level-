import User from "../../models/User.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";
import Token from "../../models/Token.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await Token.create({ user: user._id, refreshToken });
    
    // Return user data along with tokens
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ 
      accessToken, 
      refreshToken,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await Token.create({ user: user._id, refreshToken });

    // Return user data along with tokens
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ 
      accessToken, 
      refreshToken,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Misiing token." });

  const stored = await Token.findOne({ refreshToken });

  if (!stored)
    return res.status(403).json({ message: "Invalid  refresh token." });
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    const newAccessToken = generateAccessToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);
    stored.refreshToken = newRefreshToken;
    await stored.save();
    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token." });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  await Token.findOneAndDelete({ refreshToken });
  res.json({ message: "Logged out successfully." });
};



export const getMe = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};