const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const AttendanceEntry = require('../models/AttendanceEntry');

// Helper to calculate day of week from YYYY-MM-DD string
const getDayOfWeek = (dateStr) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Parse with local timezone to prevent UTC offset shifting the day
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return days[date.getDay()];
};

// @desc    Get current active semester
// @route   GET /api/attendance/semester
// @access  Private
exports.getSemester = async (req, res, next) => {
  try {
    let semester = await Semester.findOne({ userId: req.user.id, isActive: true });
    if (!semester) {
      // Create a default first semester if none active
      semester = await Semester.create({
        userId: req.user.id,
        name: '3-1',
        isActive: true,
      });
    }
    res.status(200).json({ success: true, semester });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a new semester (scrubs all previous attendance data)
// @route   POST /api/attendance/semester/new
// @access  Private
exports.startNewSemester = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a semester name' });
    }

    // 1. Delete all subjects for this user
    await Subject.deleteMany({ userId: req.user.id });

    // 2. Delete all attendance entries for this user
    await AttendanceEntry.deleteMany({ userId: req.user.id });

    // 3. Deactivate existing semesters
    await Semester.updateMany({ userId: req.user.id }, { $set: { isActive: false } });

    // 4. Create or update active semester
    const newSemester = await Semester.create({
      userId: req.user.id,
      name,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      message: `Successfully started semester ${name}. All old records scrubbed.`,
      semester: newSemester,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects for current semester
// @route   GET /api/attendance/subjects
// @access  Private
exports.getSubjects = async (req, res, next) => {
  try {
    const semester = await Semester.findOne({ userId: req.user.id, isActive: true });
    if (!semester) {
      return res.status(200).json({ success: true, subjects: [] });
    }

    const subjects = await Subject.find({ semesterId: semester._id, isArchived: false }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subject
// @route   POST /api/attendance/subjects
// @access  Private
exports.createSubject = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a subject name' });
    }

    const semester = await Semester.findOne({ userId: req.user.id, isActive: true });
    if (!semester) {
      return res.status(400).json({ success: false, message: 'No active semester found. Start a semester first.' });
    }

    const subject = await Subject.create({
      userId: req.user.id,
      semesterId: semester._id,
      name,
      presentPeriods: 0,
      totalPeriods: 0,
    });

    res.status(201).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/attendance/subjects/:id
// @access  Private
exports.updateSubject = async (req, res, next) => {
  try {
    const { name } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/attendance/subjects/:id
// @access  Private
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Clean up references to this subject in daily entries
    await AttendanceEntry.updateMany(
      { userId: req.user.id },
      { $pull: { subjects: { subjectId: req.params.id } } }
    );

    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Manual overwrite of subject period counts
// @route   PUT /api/attendance/subjects/:id/periods
// @access  Private
exports.manualOverridePeriods = async (req, res, next) => {
  try {
    const { presentPeriods, totalPeriods } = req.body;
    
    const pVal = Number(presentPeriods);
    const tVal = Number(totalPeriods);

    if (isNaN(pVal) || isNaN(tVal) || pVal < 0 || tVal < 0) {
      return res.status(400).json({ success: false, message: 'Periods must be non-negative numbers' });
    }

    if (pVal > tVal) {
      return res.status(400).json({ success: false, message: 'Present periods cannot exceed total periods' });
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { presentPeriods: pVal, totalPeriods: tVal },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick increment/decrement counters on subject card
// @route   PUT /api/attendance/subjects/:id/counter
// @access  Private
exports.quickCounterClick = async (req, res, next) => {
  try {
    const { action } = req.body;
    
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (action === 'addPresent') {
      subject.presentPeriods += 1;
      subject.totalPeriods += 1;
    } else if (action === 'subPresent') {
      subject.presentPeriods = Math.max(0, subject.presentPeriods - 1);
      // Ensure total doesn't fall below present
      subject.totalPeriods = Math.max(subject.presentPeriods, subject.totalPeriods - 1);
    } else if (action === 'addTotal') {
      subject.totalPeriods += 1;
    } else if (action === 'subTotal') {
      subject.totalPeriods = Math.max(subject.presentPeriods, subject.totalPeriods - 1);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action name' });
    }

    await subject.save();
    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Save subject schedule slots
// @route   PUT /api/attendance/subjects/:id/schedule
// @access  Private
exports.saveSubjectSchedule = async (req, res, next) => {
  try {
    const { schedule } = req.body; // Array of { dayOfWeek, periods }
    
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { schedule },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all daily attendance logs
// @route   GET /api/attendance/entries
// @access  Private
exports.getAttendanceEntries = async (req, res, next) => {
  try {
    const semester = await Semester.findOne({ userId: req.user.id, isActive: true });
    if (!semester) {
      return res.status(200).json({ success: true, entries: [] });
    }

    const entries = await AttendanceEntry.find({ semesterId: semester._id, userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, entries });
  } catch (error) {
    next(error);
  }
};

// @desc    Save daily attendance log (Day override or subject list)
// @route   POST /api/attendance/entries
// @access  Private
exports.saveAttendanceEntry = async (req, res, next) => {
  try {
    const { date, entryType, dayStatus, subjects } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Please specify a date' });
    }

    const semester = await Semester.findOne({ userId: req.user.id, isActive: true });
    if (!semester) {
      return res.status(400).json({ success: false, message: 'No active semester found' });
    }

    const dayOfWeek = getDayOfWeek(date);

    // 1. REVERSION LOGIC: Find existing entry for this date and reverse its subject values
    const existingEntry = await AttendanceEntry.findOne({ userId: req.user.id, date });
    if (existingEntry) {
      for (const item of existingEntry.subjects) {
        const sub = await Subject.findOne({ _id: item.subjectId, userId: req.user.id });
        if (sub) {
          sub.totalPeriods = Math.max(0, sub.totalPeriods - item.periodsCount);
          if (item.status === 'Present') {
            sub.presentPeriods = Math.max(0, sub.presentPeriods - item.periodsCount);
          }
          await sub.save();
        }
      }
    }

    // 2. ADDITION LOGIC: Process new logs
    const processedSubjects = [];

    // Helper: find period count from schedule on this day of week
    const getScheduledPeriodsCount = (subject, day) => {
      const daySchedule = subject.schedule.find(s => s.dayOfWeek === day);
      return daySchedule ? daySchedule.periods.length : 0;
    };

    if (entryType === 'Day') {
      // Find all subjects for this semester to apply full-day status
      const allSubjects = await Subject.find({ semesterId: semester._id, isArchived: false });
      
      for (const sub of allSubjects) {
        const scheduledPeriods = getScheduledPeriodsCount(sub, dayOfWeek);
        
        // Only log if subject actually has classes scheduled today
        if (scheduledPeriods > 0) {
          const isPresent = dayStatus === 'Present';
          const isAbsent = dayStatus === 'Absent';
          
          if (isPresent || isAbsent) {
            sub.totalPeriods += scheduledPeriods;
            if (isPresent) {
              sub.presentPeriods += scheduledPeriods;
            }
            await sub.save();
          }

          processedSubjects.push({
            subjectId: sub._id,
            status: dayStatus === 'Present' ? 'Present' : (dayStatus === 'Absent' ? 'Absent' : 'Holiday'),
            periodsCount: scheduledPeriods
          });
        }
      }
    } else {
      // Subject-wise manual entries list
      for (const item of (subjects || [])) {
        const sub = await Subject.findOne({ _id: item.subjectId, userId: req.user.id });
        if (sub) {
          let count = getScheduledPeriodsCount(sub, dayOfWeek);
          if (count === 0) {
            count = 1; // Fallback: if not scheduled, default to 1 period
          }

          if (item.status === 'Present' || item.status === 'Absent') {
            sub.totalPeriods += count;
            if (item.status === 'Present') {
              sub.presentPeriods += count;
            }
            await sub.save();
          }

          processedSubjects.push({
            subjectId: sub._id,
            status: item.status,
            periodsCount: count
          });
        }
      }
    }

    // 3. Write log to database
    let entry;
    if (existingEntry) {
      existingEntry.entryType = entryType;
      existingEntry.dayStatus = dayStatus;
      existingEntry.subjects = processedSubjects;
      entry = await existingEntry.save();
    } else {
      entry = await AttendanceEntry.create({
        userId: req.user.id,
        semesterId: semester._id,
        date,
        entryType,
        dayStatus,
        subjects: processedSubjects,
      });
    }

    res.status(200).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic summary for Dashboard
// @route   GET /api/attendance/summary
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const semester = await Semester.findOne({ userId: req.user.id, isActive: true });
    if (!semester) {
      return res.status(200).json({
        success: true,
        summary: {
          overallPercentage: 0,
          totalPeriods: 0,
          presentPeriods: 0,
          bestSubject: 'N/A',
          lowestSubject: 'N/A',
          status: 'SAFE',
          bufferMessage: 'No active semester configuration.'
        }
      });
    }

    const subjects = await Subject.find({ semesterId: semester._id, isArchived: false });
    
    let totalP = 0;
    let totalT = 0;
    let bestSub = null;
    let worstSub = null;

    subjects.forEach((sub) => {
      totalP += sub.presentPeriods;
      totalT += sub.totalPeriods;

      const pct = sub.totalPeriods > 0 ? (sub.presentPeriods / sub.totalPeriods) * 100 : 100;
      
      if (!bestSub || pct > bestSub.pct) {
        bestSub = { name: sub.name, pct };
      }
      if (!worstSub || pct < worstSub.pct) {
        worstSub = { name: sub.name, pct };
      }
    });

    const overallPct = totalT > 0 ? Math.round((totalP / totalT) * 1000) / 10 : 100;
    
    // Status threshold check
    let status = 'SAFE';
    if (overallPct < 70) {
      status = 'DANGER';
    } else if (overallPct < 76) {
      status = 'WARNING';
    }

    // Buffer skip or consecutive attendance calculation
    let bufferMessage = '';
    if (totalT === 0) {
      bufferMessage = 'No attendance periods recorded yet.';
    } else if (overallPct >= 76) {
      const maxMissable = Math.floor((totalP * 100 - 76 * totalT) / 76);
      bufferMessage = maxMissable > 0
        ? `You can miss ${maxMissable} more period${maxMissable > 1 ? 's' : ''}`
        : 'You cannot miss any more classes without falling below 76%';
    } else {
      const minNeeded = Math.ceil((76 * totalT - 100 * totalP) / 24);
      bufferMessage = `You need to attend ${minNeeded} consecutive period${minNeeded > 1 ? 's' : ''} to reach 76%`;
    }

    res.status(200).json({
      success: true,
      summary: {
        semesterName: semester.name,
        overallPercentage: overallPct,
        totalPeriods: totalT,
        presentPeriods: totalP,
        bestSubject: bestSub ? `${bestSub.name} (${Math.round(bestSub.pct)}%)` : 'N/A',
        lowestSubject: worstSub ? `${worstSub.name} (${Math.round(worstSub.pct)}%)` : 'N/A',
        status,
        bufferMessage,
      }
    });
  } catch (error) {
    next(error);
  }
};
