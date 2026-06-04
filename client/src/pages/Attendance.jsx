import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import AttendanceDashboard from '../components/attendance/AttendanceDashboard';
import DailyAttendance from '../components/attendance/DailyAttendance';
import AttendanceSubjects from '../components/attendance/AttendanceSubjects';
import SemesterSettings from '../components/attendance/SemesterSettings';
import {
  LayoutDashboard,
  CalendarRange,
  BookOpen,
  Settings,
  AlertTriangle
} from 'lucide-react';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSemester = async () => {
    try {
      const data = await apiRequest('/attendance/semester');
      if (data.success) {
        setSemester(data.semester);
      }
    } catch (err) {
      console.error('Failed to load active semester:', err);
      setErrorMessage('Could not connect to attendance backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemester();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Header Navigation */}
      <div className="flex border-b border-white/5 pb-0.5 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === 'dashboard'
              ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard size={14} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === 'daily'
              ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CalendarRange size={14} />
          <span>Daily Entry</span>
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === 'subjects'
              ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen size={14} />
          <span>Subjects</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-mono text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === 'settings'
              ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings size={14} />
          <span>Semester Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[50vh]">
        {activeTab === 'dashboard' && <AttendanceDashboard semester={semester} />}
        {activeTab === 'daily' && <DailyAttendance semester={semester} />}
        {activeTab === 'subjects' && <AttendanceSubjects semester={semester} />}
        {activeTab === 'settings' && (
          <SemesterSettings
            semester={semester}
            onSemesterReset={() => {
              fetchSemester();
              setActiveTab('subjects'); // send to subjects to recreate them
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;
