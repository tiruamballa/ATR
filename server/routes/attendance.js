const express = require('express');
const {
  getSemester,
  startNewSemester,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  manualOverridePeriods,
  quickCounterClick,
  saveSubjectSchedule,
  getAttendanceEntries,
  saveAttendanceEntry,
  getDashboardSummary
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply JWT auth protection to all attendance routes
router.use(protect);

router.get('/semester', getSemester);
router.post('/semester/new', startNewSemester);

router.route('/subjects')
  .get(getSubjects)
  .post(createSubject);

router.route('/subjects/:id')
  .put(updateSubject)
  .delete(deleteSubject);

router.put('/subjects/:id/periods', manualOverridePeriods);
router.put('/subjects/:id/counter', quickCounterClick);
router.put('/subjects/:id/schedule', saveSubjectSchedule);

router.route('/entries')
  .get(getAttendanceEntries)
  .post(saveAttendanceEntry);

router.get('/summary', getDashboardSummary);

module.exports = router;
