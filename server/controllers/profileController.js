const User = require('../models/User');
const Phase = require('../models/Phase');
const Week = require('../models/Week');
const Topic = require('../models/Topic');
const DSATopic = require('../models/DSATopic');
const DSAQuestion = require('../models/DSAQuestion');
const AptitudeTopic = require('../models/AptitudeTopic');

// @desc    Update target settings (study hours, DSA question counts, and attendance goals)
// @route   PUT /api/profile/targets
// @access  Private
exports.updateTargets = async (req, res, next) => {
  try {
    const { studyHoursTarget, dsaTarget, attendanceTarget } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (studyHoursTarget !== undefined) user.studyHoursTarget = Number(studyHoursTarget);
    if (dsaTarget !== undefined) user.dsaTarget = Number(dsaTarget);
    if (attendanceTarget !== undefined) user.attendanceTarget = Number(attendanceTarget);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Targets updated successfully',
      targets: {
        studyHoursTarget: user.studyHoursTarget,
        dsaTarget: user.dsaTarget,
        attendanceTarget: user.attendanceTarget
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get V4 execution progress metrics, readiness scores, and remaining days
// @route   GET /api/profile/readiness
// @access  Private
exports.getReadinessScores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Target Dates Configuration
    const now = new Date();
    const startDate = new Date('2026-06-15');
    const internshipDate = new Date('2027-02-01');
    const placementDate = new Date('2027-11-01');

    // 2. Expected Progress % (Linear from 15 June 2026 to 1 Nov 2027 - 504 days total)
    const totalDurationMs = placementDate - startDate;
    const elapsedMs = now - startDate;
    let expectedProgressPercent = 0;
    if (elapsedMs > 0) {
      expectedProgressPercent = Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100));
    }

    // 3. Actual Progress %
    // Fetch all phases and weeks to map milestones
    const earlyPhases = await Phase.find({ userId, monthIndex: { $lte: 7 } }); // Month index 0-7 = first 8 months
    const earlyPhaseIds = earlyPhases.map(p => p._id);
    const earlyWeeks = await Week.find({ userId, phaseId: { $in: earlyPhaseIds } });
    const earlyWeekIds = earlyWeeks.map(w => w._id.toString());

    // Fetch topics matching categories Development & IP Skills
    const allRoadmapTopics = await Topic.find({ userId, category: { $in: ['Development', 'IP Skills'] } });

    let totalRoadmapSub = 0;
    let completedRoadmapSub = 0;
    let totalRoadmapTopics = 0;
    let completedRoadmapTopics = 0;
    let earlyRoadmapSub = 0;
    let earlyRoadmapCompletedSub = 0;

    allRoadmapTopics.forEach(t => {
      totalRoadmapTopics++;
      if (t.isCompleted) completedRoadmapTopics++;

      const isEarly = earlyWeekIds.includes(t.weekId.toString());
      t.subtopics.forEach(s => {
        totalRoadmapSub++;
        if (s.isCompleted) completedRoadmapSub++;
        if (isEarly) {
          earlyRoadmapSub++;
          if (s.isCompleted) earlyRoadmapCompletedSub++;
        }
      });
    });

    const roadmapPct = totalRoadmapSub > 0 ? (completedRoadmapSub / totalRoadmapSub) * 100 : 0;
    const earlyRoadmapPct = earlyRoadmapSub > 0 ? (earlyRoadmapCompletedSub / earlyRoadmapSub) * 100 : 0;

    // B. DSA Progress from DSATopic subtopics
    const dsaTopics = await DSATopic.find({ userId });
    let totalDsaSub = 0;
    let completedDsaSub = 0;
    let totalSolvedQuestions = 0;
    dsaTopics.forEach(t => {
      t.subtopics.forEach(s => {
        totalDsaSub++;
        if (s.isCompleted) completedDsaSub++;
        totalSolvedQuestions += (s.questionsSolved || 0);
      });
    });
    const dsaPct = totalDsaSub > 0 ? (completedDsaSub / totalDsaSub) * 100 : 0;

    // C. Aptitude Topics Progress
    const aptTopics = await AptitudeTopic.find({ userId });
    let totalAptSub = 0;
    let completedAptSub = 0;
    let totalApt = 0;
    let completedApt = 0;

    aptTopics.forEach(t => {
      totalApt++;
      if (t.isCompleted) completedApt++;
      t.subtopics.forEach(s => {
        totalAptSub++;
        if (s.isCompleted) completedAptSub++;
      });
    });

    const aptPct = totalAptSub > 0 ? (completedAptSub / totalAptSub) * 100 : 0;

    // Overall actual progress: weighted average
    // Roadmap = 50%, DSA = 30%, Aptitude = 20%
    const actualProgressPercent = Math.round(
      (roadmapPct * 0.5) + (dsaPct * 0.3) + (aptPct * 0.2)
    );

    // 4. Gap Remaining %
    const gapPercent = Math.max(-100, Math.min(100, Math.round(expectedProgressPercent - actualProgressPercent)));

    // 5. Days Remaining to Goals
    const diffToInternship = internshipDate - now;
    const daysToInternship = Math.max(0, Math.ceil(diffToInternship / (1000 * 60 * 60 * 24)));

    const diffToPlacement = placementDate - now;
    const daysToPlacement = Math.max(0, Math.ceil(diffToPlacement / (1000 * 60 * 60 * 24)));

    // Roadmap Day: Current relative day out of 505 days
    const roadmapDay = Math.max(1, Math.min(505, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1));

    // 6. Internship Readiness (weighted by early phases completion and basic DSA)
    // Scale: early roadmap = 60%, DSA solved ratio = 40%
    const internshipReadiness = Math.min(100, Math.round(
      (earlyRoadmapPct * 0.6) + (dsaPct * 0.4)
    ));

    // 7. Placement Readiness (scaled from overall actual progress)
    const placementReadiness = Math.min(100, actualProgressPercent);

    res.status(200).json({
      success: true,
      metrics: {
        expectedProgressPercent,
        actualProgressPercent,
        gapPercent,
        daysToInternship,
        daysToPlacement,
        internshipReadiness,
        placementReadiness,
        totalRoadmapTopics,
        completedRoadmapTopics,
        totalDsa: totalDsaSub,
        solvedDsa: completedDsaSub,
        totalSolvedQuestions,
        dsaPct: Math.round(dsaPct),
        totalApt,
        completedApt,
        aptPct: Math.round(aptPct),
        roadmapPct: Math.round(roadmapPct),
        roadmapDay
      },
      targets: {
        studyHoursTarget: user.studyHoursTarget,
        dsaTarget: user.dsaTarget,
        attendanceTarget: user.attendanceTarget
      }
    });
  } catch (error) {
    next(error);
  }
};

// Simulated placeholders for backwards compatibility if needed, else cleaned
exports.updateGithubStats = async (req, res) => {
  res.status(200).json({ success: true, message: 'Endpoint deprecated in V4' });
};

exports.updateSkills = async (req, res) => {
  res.status(200).json({ success: true, message: 'Endpoint deprecated in V4' });
};

exports.addResumeVersion = async (req, res) => {
  res.status(200).json({ success: true, message: 'Endpoint deprecated in V4' });
};

exports.updateLeetcodeUsername = async (req, res) => {
  res.status(200).json({ success: true, message: 'Endpoint deprecated in V4' });
};
