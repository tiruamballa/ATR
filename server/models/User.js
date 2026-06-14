const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  leetcodeUsername: {
    type: String,
    default: '',
  },
  githubStats: {
    repos: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    projectsCount: { type: Number, default: 0 },
  },
  resumes: [
    {
      version: { type: String, enum: ['v1', 'v2', 'v3'], required: true },
      fileUrl: { type: String, required: true },
      fileName: { type: String, required: true },
      date: { type: Date, default: Date.now },
      notes: { type: String, default: '' },
    }
  ],
  skillsProficiency: {
    react: { type: Number, default: 0 },
    backend: { type: Number, default: 0 },
    sql: { type: Number, default: 0 },
    dbms: { type: Number, default: 0 },
    os: { type: Number, default: 0 },
    cn: { type: Number, default: 0 },
    oops: { type: Number, default: 0 },
    aptitude: { type: Number, default: 0 },
    mockInterviews: { type: Number, default: 0 },
  },
  studyHoursTarget: {
    type: Number,
    default: 4,
  },
  dsaTarget: {
    type: Number,
    default: 4,
  },
  attendanceTarget: {
    type: Number,
    default: 75,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
