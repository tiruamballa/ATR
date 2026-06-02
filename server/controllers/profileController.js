const User = require('../models/User');
const DSATopic = require('../models/DSATopic');
const AptitudeTopic = require('../models/AptitudeTopic');

// @desc    Update GitHub Profile stats
// @route   POST /api/profile/github
// @access  Private
exports.updateGithubStats = async (req, res, next) => {
  try {
    const { repos, contributions, streak, projectsCount } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (repos !== undefined) user.githubStats.repos = Number(repos);
    if (contributions !== undefined) user.githubStats.contributions = Number(contributions);
    if (streak !== undefined) user.githubStats.streak = Number(streak);
    if (projectsCount !== undefined) user.githubStats.projectsCount = Number(projectsCount);

    await user.save();

    res.status(200).json({
      success: true,
      githubStats: user.githubStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update skill proficiency levels
// @route   POST /api/profile/skills
// @access  Private
exports.updateSkills = async (req, res, next) => {
  try {
    const { react, backend, sql, dbms, os, cn, oops, aptitude, mockInterviews } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (react !== undefined) user.skillsProficiency.react = Number(react);
    if (backend !== undefined) user.skillsProficiency.backend = Number(backend);
    if (sql !== undefined) user.skillsProficiency.sql = Number(sql);
    if (dbms !== undefined) user.skillsProficiency.dbms = Number(dbms);
    if (os !== undefined) user.skillsProficiency.os = Number(os);
    if (cn !== undefined) user.skillsProficiency.cn = Number(cn);
    if (oops !== undefined) user.skillsProficiency.oops = Number(oops);
    if (aptitude !== undefined) user.skillsProficiency.aptitude = Number(aptitude);
    if (mockInterviews !== undefined) user.skillsProficiency.mockInterviews = Number(mockInterviews);

    await user.save();

    res.status(200).json({
      success: true,
      skillsProficiency: user.skillsProficiency,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload or add a resume version (simulated)
// @route   POST /api/profile/resumes
// @access  Private
exports.addResumeVersion = async (req, res, next) => {
  try {
    const { version, fileName, fileUrl, notes } = req.body;

    if (!version || !fileName || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide version (v1/v2/v3), fileName, and fileUrl',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if version already uploaded, if yes - update it; if no - push it
    const existingIndex = user.resumes.findIndex((r) => r.version === version);
    if (existingIndex !== -1) {
      user.resumes[existingIndex] = {
        version,
        fileName,
        fileUrl,
        notes: notes || '',
        date: Date.now(),
      };
    } else {
      user.resumes.push({
        version,
        fileName,
        fileUrl,
        notes: notes || '',
        date: Date.now(),
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      resumes: user.resumes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Internship & Placement Readiness Scores
// @route   GET /api/profile/readiness
// @access  Private
exports.getReadinessScores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get DSA progress
    const dsaTopics = await DSATopic.find({ userId });
    let totalDsaSolved = 0;
    let totalDsaTarget = 0;
    dsaTopics.forEach(t => {
      totalDsaSolved += t.solvedQuestions;
      totalDsaTarget += t.targetQuestions;
    });
    const dsaRatio = totalDsaTarget > 0 ? (totalDsaSolved / totalDsaTarget) : 0;
    const dsaCompletionPercent = Math.min(100, Math.round(dsaRatio * 100));

    // Get Aptitude progress
    const aptTopics = await AptitudeTopic.find({ userId });
    let totalAptAccuracy = 0;
    aptTopics.forEach(t => {
      totalAptAccuracy += t.accuracy;
    });
    const avgAptAccuracy = aptTopics.length > 0 ? Math.round(totalAptAccuracy / aptTopics.length) : 0;

    // Resumes check
    const hasResumeV1 = user.resumes.some(r => r.version === 'v1');
    const hasResumeV2 = user.resumes.some(r => r.version === 'v2');
    const hasResumeV3 = user.resumes.some(r => r.version === 'v3');

    // 1. Internship Readiness Score (0-100)
    // Factors:
    // - DSA Progress (25%)
    // - Projects completed (25%) -> scaled to max 4 projects
    // - React (15%)
    // - Backend (15%)
    // - SQL & DBMS (10%)
    // - Resume v1 completion (5%)
    // - GitHub contributions (5%) -> scaled to max 100
    const dsaFactor = dsaCompletionPercent * 0.25;
    const projectsFactor = Math.min(100, (user.githubStats.projectsCount / 4) * 100) * 0.25;
    const reactFactor = user.skillsProficiency.react * 0.15;
    const backendFactor = user.skillsProficiency.backend * 0.15;
    const sqlDbmsFactor = ((user.skillsProficiency.sql + user.skillsProficiency.dbms) / 2) * 0.10;
    const resumeFactor = hasResumeV1 ? 5 : 0;
    const githubFactor = Math.min(100, (user.githubStats.contributions / 100) * 100) * 0.05;

    const internshipScore = Math.round(
      dsaFactor + projectsFactor + reactFactor + backendFactor + sqlDbmsFactor + resumeFactor + githubFactor
    );

    // 2. Placement Readiness Score (0-100)
    // Factors:
    // - DSA advanced progress (20%)
    // - OS concepts (15%)
    // - DBMS & SQL depth (15%)
    // - Computer Networks (15%)
    // - OOPs design (10%)
    // - Projects (10%) -> scaled to max 4
    // - Aptitude score (10%)
    // - Mock Interviews (5%) -> scaled to max 5 mocks
    const dsaAdvFactor = dsaCompletionPercent * 0.20;
    const osFactor = user.skillsProficiency.os * 0.15;
    const dbmsSqlFactor = ((user.skillsProficiency.sql + user.skillsProficiency.dbms) / 2) * 0.15;
    const cnFactor = user.skillsProficiency.cn * 0.15;
    const oopsFactor = user.skillsProficiency.oops * 0.10;
    const projectsAdvFactor = Math.min(100, (user.githubStats.projectsCount / 4) * 100) * 0.10;
    const aptitudeFactor = user.skillsProficiency.aptitude * 0.10;
    const mockInterviewFactor = Math.min(5, user.skillsProficiency.mockInterviews) * 20 * 0.05; // 5 mocks is 100%

    const placementScore = Math.round(
      dsaAdvFactor + osFactor + dbmsSqlFactor + cnFactor + oopsFactor + projectsAdvFactor + aptitudeFactor + mockInterviewFactor
    );

    res.status(200).json({
      success: true,
      internshipScore: Math.min(100, internshipScore),
      placementScore: Math.min(100, placementScore),
      breakdown: {
        dsaCompletionPercent,
        avgAptAccuracy,
        hasResumeV1,
        hasResumeV2,
        hasResumeV3,
        githubProjects: user.githubStats.projectsCount,
        githubContributions: user.githubStats.contributions,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Configure LeetCode username
// @route   POST /api/profile/leetcode-username
// @access  Private
exports.updateLeetcodeUsername = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.leetcodeUsername = username || '';
    await user.save();

    res.status(200).json({
      success: true,
      leetcodeUsername: user.leetcodeUsername,
    });
  } catch (error) {
    next(error);
  }
};
