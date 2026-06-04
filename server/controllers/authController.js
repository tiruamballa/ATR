const User = require('../models/User');
const Streak = require('../models/Streak');
const DSATopic = require('../models/DSATopic');
const AptitudeTopic = require('../models/AptitudeTopic');
const jwt = require('jsonwebtoken');

// Helper to generate tokens and respond with cookies
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretaccesstokenkey123!', {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshtokenkey456!', {
    expiresIn: '7d',
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
  return res.status(403).json({
    success: false,
    message: 'Registration is disabled. Only tiruamballa can access this platform.',
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the passcode',
      });
    }

    if (password !== '100207') {
      return res.status(401).json({
        success: false,
        message: 'Invalid passcode',
      });
    }

    // Find the single user
    let user = await User.findOne({ email: 'tiruamballa@atr.com' });
    if (!user) {
      // Self-healing creation if not present in DB
      user = await User.create({
        name: 'tiruamballa',
        email: 'tiruamballa@atr.com',
        password: '100207',
        leetcodeUsername: '',
        githubStats: {
          repos: 0,
          contributions: 0,
          streak: 0,
          projectsCount: 0,
        },
        resumes: [],
        skillsProficiency: {
          react: 0,
          backend: 0,
          sql: 0,
          dbms: 0,
          os: 0,
          cn: 0,
          oops: 0,
          aptitude: 0,
          mockInterviews: 0,
        }
      });

      // Initialize daily tracker streak
      await Streak.create({ userId: user._id, currentStreak: 0, longestStreak: 0 });

      // Initialize DSA topics (14 topics)
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
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshtokenkey456!');

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token user reference',
      });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretaccesstokenkey123!', {
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
