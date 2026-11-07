import React from 'react';
import {
  CalendarCheck,
  FileSpreadsheet,
  Users,
  History,
  PlusCircle,
  LogOut,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  currentTab: 'dashboard' | 'take_attendance' | 'monthly_report' | 'students' | 'history';
  onSelectTab: (tab: 'dashboard' | 'take_attendance' | 'monthly_report' | 'students' | 'history') => void;
  onOpenTakeAttendance: () => void;
  onLogout: () => void;
  onSwitchUserPrompt: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onSelectTab,
  onOpenTakeAttendance,
  onLogout,
  onSwitchUserPrompt,
}) => {
  const isTeacher = currentUser.role === 'profesor';

  return (
    <header className="bg-[#12263f] text-white border-b-4 border-[#d4a017] shadow-md sticky top-0 z-40 w-full">
      {/* Top institutional strip - Fully responsive */}
      <div className="bg-[#0b1a2d] px-3 sm:px-4 py-1 text-xs text-slate-300 border-b border-[#1c3656]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* School Name in strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200 truncate text-[11px] sm:text-xs">
              I.P.E.T. N° 247 • Ing. Carlos A. Cassaffousth
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline truncate text-[11px] sm:text-xs">
              Libro de Asistencias 2026
            </span>
          </div>

          {/* Role Switcher Button */}
          <div className="shrink-0 pr-1 sm:pr-0">
            <button
              onClick={onSwitchUserPrompt}
              className="text-amber-300 hover:text-amber-200 hover:underline cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs bg-[#173254] px-2 py-0.5 rounded border border-amber-400/40 font-medium active:scale-95 transition-transform"
              title="Alternar entre profesor y preceptor para probar la app"
            >
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">Rol: </span>
              <span className="font-bold">{isTeacher ? 'Profesor' : 'Preceptor'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo & School Title Container with authentic uploaded emblem */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0 shrink"
          >
            {/* Authentic School Emblem from public assets */}
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/cassa-sn-fondo_ebfb5d01.png"
                alt="Escudo Oficial I.P.E.T. N° 247"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-tight">
                <span className="font-black text-sm sm:text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
                  I.P.E.T. N° 247
                </span>
                <span className="bg-[#1c3c63] text-amber-300 text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded border border-amber-400/40 whitespace-nowrap hidden xs:inline-block">
                  {isTeacher ? 'Profesor' : 'Preceptoría'}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-300 hidden md:block">
                {isTeacher
                  ? 'Registro de Asistencias por Cátedra'
                  : 'Control General Institucional'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-2 rounded-t-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                currentTab === 'dashboard'
                  ? 'bg-white text-[#12263f] border-b-2 border-white shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-[#1a385c] border-transparent'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Inicio</span>
            </button>

            <button
              onClick={() => onSelectTab('monthly_report')}
              className={`px-3 py-2 rounded-t-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                currentTab === 'monthly_report'
                  ? 'bg-white text-[#12263f] border-b-2 border-white shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-[#1a385c] border-transparent'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Planilla Mensual</span>
            </button>

            <button
              onClick={() => onSelectTab('students')}
              className={`px-3 py-2 rounded-t-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                currentTab === 'students'
                  ? 'bg-white text-[#12263f] border-b-2 border-white shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-[#1a385c] border-transparent'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Alumnos</span>
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`px-3 py-2 rounded-t-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
                currentTab === 'history'
                  ? 'bg-white text-[#12263f] border-b-2 border-white shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-[#1a385c] border-transparent'
              }`}
            >
              <History className="w-4 h-4 text-cyan-300" />
              <span>Historial</span>
            </button>
          </nav>

          {/* Action Button & User Info - Safe margins from scrollbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-1 sm:pr-0">
            {/* Responsive Attendance Button - Never gets cut off by the scrollbar */}
            <button
              onClick={onOpenTakeAttendance}
              className={`bg-[#2d7a46] hover:bg-[#236338] text-white font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer border border-emerald-300/40 active:scale-95 shrink-0 ${
                currentTab === 'take_attendance' ? 'ring-2 ring-amber-300 bg-[#236338]' : ''
              }`}
              title="Añadir las asistencias del día de hoy"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span className="whitespace-nowrap">
                <span className="hidden sm:inline">Añadir </span>Asistencias
              </span>
            </button>

            {/* User Profile Info on Desktop */}
            <div className="hidden lg:flex items-center pl-2 border-l border-slate-600 gap-2">
              <div className="text-right">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-300">
                  Turno {currentUser.turn}
                </div>
              </div>

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white border border-white/40 shrink-0 ${
                  isTeacher ? 'bg-[#1b6b93]' : 'bg-[#a35d14]'
                }`}
              >
                {currentUser.name.charAt(0)}
              </div>

              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="text-slate-300 hover:text-rose-300 p-1 rounded hover:bg-[#1a385c] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs Row */}
        <div className="flex md:hidden items-center justify-around py-1.5 border-t border-slate-700/80 text-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-0.5 ${
              currentTab === 'dashboard' ? 'text-amber-300' : 'text-slate-300'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span className="text-[10px]">Inicio</span>
          </button>

          <button
            onClick={onOpenTakeAttendance}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-0.5 ${
              currentTab === 'take_attendance' ? 'text-amber-300' : 'text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px]">Asistencia</span>
          </button>

          <button
            onClick={() => onSelectTab('monthly_report')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-0.5 ${
              currentTab === 'monthly_report' ? 'text-amber-300' : 'text-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="text-[10px]">Planillas</span>
          </button>

          <button
            onClick={() => onSelectTab('students')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-0.5 ${
              currentTab === 'students' ? 'text-amber-300' : 'text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px]">Alumnos</span>
          </button>

          <button
            onClick={onLogout}
            className="py-1 px-2 font-bold flex flex-col items-center gap-0.5 text-rose-300"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px]">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
