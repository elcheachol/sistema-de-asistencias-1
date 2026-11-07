/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceSheet } from './types';
import {
  initializeStorage,
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { TakeAttendanceView } from './components/TakeAttendanceView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { StudentsView } from './components/StudentsView';
import { AttendanceHistoryView } from './components/AttendanceHistoryView';
import { SwitchUserModal } from './components/SwitchUserModal';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'take_attendance' | 'monthly_report' | 'students' | 'history'
  >('dashboard');

  // Navigation parameters for pre-filling views
  const [prefilledCourseId, setPrefilledCourseId] = useState<string | undefined>(undefined);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);
  const [prefilledReportMonth, setPrefilledReportMonth] = useState<number | undefined>(undefined);
  const [prefilledReportYear, setPrefilledReportYear] = useState<number | undefined>(undefined);

  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);

  useEffect(() => {
    initializeStorage();
    const user = getCurrentUser();
    setCurrentUserState(user);
    setIsInitialized(true);
  }, []);

  const handleLogin = (user: UserProfile) => {
    persistCurrentUser(user);
    setCurrentUserState(user);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    persistCurrentUser(null);
    setCurrentUserState(null);
  };

  const handleSelectUser = (user: UserProfile) => {
    persistCurrentUser(user);
    setCurrentUserState(user);
  };

  const handleOpenTakeAttendance = (courseId?: string, date?: string) => {
    setPrefilledCourseId(courseId);
    setPrefilledDate(date);
    setCurrentTab('take_attendance');
  };

  const handleGoToMonthlyReport = (courseId?: string, month?: number, year?: number) => {
    setPrefilledCourseId(courseId);
    setPrefilledReportMonth(month);
    setPrefilledReportYear(year);
    setCurrentTab('monthly_report');
  };

  const handleGoToStudents = (courseId?: string) => {
    setPrefilledCourseId(courseId);
    setCurrentTab('students');
  };

  const handleEditSheetFromHistory = (sheet: AttendanceSheet) => {
    setPrefilledCourseId(sheet.courseId);
    setPrefilledDate(sheet.date);
    setCurrentTab('take_attendance');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center text-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#143254] border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-sm">Cargando sistema del I.P.E.T. N° 247...</span>
        </div>
      </div>
    );
  }

  // If no user is logged in, show institutional login page with Preceptores / Profesores choice
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={tab => {
          setPrefilledCourseId(undefined);
          setPrefilledDate(undefined);
          setCurrentTab(tab);
        }}
        onOpenTakeAttendance={() => handleOpenTakeAttendance()}
        onLogout={handleLogout}
        onSwitchUserPrompt={() => setIsSwitchUserModalOpen(true)}
      />

      {/* Main Content Area - with pb-20 for mobile bottom navigation safe zone */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 pb-20 md:pb-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            onOpenTakeAttendance={handleOpenTakeAttendance}
            onGoToMonthlyReport={handleGoToMonthlyReport}
            onGoToStudents={handleGoToStudents}
          />
        )}

        {currentTab === 'take_attendance' && (
          <TakeAttendanceView
            key={`take-${prefilledCourseId || 'default'}-${prefilledDate || 'today'}`}
            currentUser={currentUser}
            initialCourseId={prefilledCourseId}
            initialDate={prefilledDate}
            onGoToMonthlyReport={handleGoToMonthlyReport}
          />
        )}

        {currentTab === 'monthly_report' && (
          <MonthlyReportView
            key={`report-${prefilledCourseId || 'default'}-${prefilledReportMonth || 'def'}`}
            currentUser={currentUser}
            initialCourseId={prefilledCourseId}
            initialMonth={prefilledReportMonth}
            initialYear={prefilledReportYear}
          />
        )}

        {currentTab === 'students' && (
          <StudentsView
            currentUser={currentUser}
            initialCourseId={prefilledCourseId}
            onTakeAttendanceForCourse={handleOpenTakeAttendance}
          />
        )}

        {currentTab === 'history' && (
          <AttendanceHistoryView
            currentUser={currentUser}
            onEditSheet={handleEditSheetFromHistory}
          />
        )}
      </main>

      {/* Footer (hidden on print) */}
      <footer className="bg-[#12263f] text-slate-300 border-t-2 border-[#d4a017] py-4 text-center text-xs print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Escuela de Educación Técnica I.P.E.T. N° 247</span>
            <span>•</span>
            <span>Sistema Oficial de Asistencias & Cátedras</span>
          </div>
          <div className="text-slate-400">
            Libro de Aula Digital • Ciclo Lectivo 2026
          </div>
        </div>
      </footer>

      {/* Switch User Modal */}
      <SwitchUserModal
        currentUser={currentUser}
        isOpen={isSwitchUserModalOpen}
        onClose={() => setIsSwitchUserModalOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}
