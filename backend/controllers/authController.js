const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const generateToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET || 'secret123',
  { expiresIn: '30d' },
);
const getAuthProvider = (user) => user.authProvider === 'google'
  || (user.email && user.username.toLowerCase() === user.email.toLowerCase())
  ? 'google'
  : 'local';

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const normalizedUsername = typeof username === 'string' ? username.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedUsername || !normalizedEmail || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Please provide a username, valid email, and password' });
  }
  if (normalizedUsername.length < 2 || normalizedUsername.length > 50) {
    return res.status(400).json({ message: 'Username must be between 2 and 50 characters' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ message: 'Use at least 8 characters with a letter and a number' });
  }

  try {
    if (await User.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] })) {
      return res.status(400).json({ message: 'That username or email is already registered' });
    }
    const user = await User.create({ username: normalizedUsername, email: normalizedEmail, password });
    return res.status(201).json({ _id: user._id, username: user.username, email: user.email, role: user.role, authProvider: getAuthProvider(user), token: generateToken(user._id) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That username or email is already registered' });
    }
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const identifier = String(username || '').trim();
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase() },
      ],
    });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid username or password' });
    return res.json({ _id: user._id, username: user.username, email: user.email, role: user.role, authProvider: getAuthProvider(user), token: generateToken(user._id) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Google did not return a sign-in credential' });
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: 'Google sign-in is not configured on the server' });

  let payload;
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error('Google credential verification failed:', error.message);
    return res.status(401).json({
      message: 'Google rejected the credential. Confirm VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID use the same OAuth web client, and that this site origin is authorized.'
    });
  }

  if (!payload?.email || payload.email_verified !== true) {
    return res.status(401).json({ message: 'Google account did not provide a verified email address' });
  }

  try {
    const email = payload.email.trim().toLowerCase();
    let user = await User.findOne({ $or: [{ email }, { username: email }] });

    if (!user) {
      user = await User.create({
        username: email,
        email,
        password: crypto.randomBytes(32).toString('hex'),
        authProvider: 'google',
      });
    } else if (!user.email) {
      user.email = email;
      await user.save();
    }
    return res.json({ _id: user._id, username: user.username, email: user.email, role: user.role, authProvider: getAuthProvider(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Google account lookup failed:', error.message);
    return res.status(503).json({
      message: 'Google verified your account, but the account database is unavailable. Check MongoDB Atlas Network Access and try again.'
    });
  }
};

const getMe = (req, res) => res.json({ _id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role, authProvider: getAuthProvider(req.user) });

const updateMe = async (req, res) => {
  if (getAuthProvider(req.user) !== 'local') {
    return res.status(403).json({ message: 'Name changes are available for email and password accounts only' });
  }
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  if (username.length < 2 || username.length > 50) {
    return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
  }
  try {
    const duplicate = await User.findOne({ username, _id: { $ne: req.user._id } });
    if (duplicate) return res.status(409).json({ message: 'That name is already in use' });
    req.user.username = username;
    await req.user.save();
    return res.json({ _id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role, authProvider: getAuthProvider(req.user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That name is already in use' });
    return res.status(500).json({ message: 'Could not update your profile' });
  }
};

module.exports = { register, login, googleAuth, getMe, updateMe };
