const User = require('../models/User');
const Streak = require('../models/Streak');
const DSATopic = require('../models/DSATopic');
const AptitudeTopic = require('../models/AptitudeTopic');
const jwt = require('jsonwebtoken');

// Helper to generate tokens and respond with cookies
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername,
        githubStats: user.githubStats,
        resumes: user.resumes,
        skillsProficiency: user.skillsProficiency,
      },
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all details: name, email, password',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already registered with this email',
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Initialize daily tracker streak
    await Streak.create({ userId: user._id });

    // Initialize DSA topics (15 topics)
    const dsaTopics = [
      'Arrays', 'Strings', 'Hashing', 'Linked List', 'Stack', 'Queue',
      'Trees', 'Graphs', 'Recursion & Backtracking', 'Dynamic Programming',
      'Greedy', 'Heap', 'Tries', 'Bit Manipulation'
    ];
    await DSATopic.insertMany(
      dsaTopics.map((topic) => ({ userId: user._id, topicName: topic }))
    );

    // Initialize Aptitude topics (8 topics)
    const aptitudeTopics = [
      'Percentages', 'Profit & Loss', 'Time & Work', 'Speed & Distance',
      'Probability', 'Permutation & Combination', 'Number Series', 'Data Interpretation'
    ];
    await AptitudeTopic.insertMany(
      aptitudeTopics.map((topic) => ({ userId: user._id, topicName: topic }))
    );

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get new access token from refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token user reference',
      });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token expired or invalid',
    });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  try {
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
