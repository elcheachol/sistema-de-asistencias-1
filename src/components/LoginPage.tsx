import React, { useState } from 'react';
import {
  School,
  ClipboardCheck,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('profesor');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [turnInput, setTurnInput] = useState<'Mañana' | 'Tarde'>('Mañana');

  const roleProfiles = INITIAL_USERS.filter(u => u.role === selectedRole);

  const handleSelectDemoProfile = (profile: UserProfile) => {
    onLogin(profile);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = nameInput.trim() || (selectedRole === 'profesor' ? 'Prof. de Cátedra' : 'Preceptor de Turno');
    const finalEmail = emailInput.trim() || `${finalName.toLowerCase().replace(/\s+/g, '.')}@ipet247.edu.ar`;

    const customUser: UserProfile = {
      id: `custom-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      role: selectedRole,
      turn: turnInput,
      assignedCourses: selectedRole === 'profesor' ? ['c-4em', 'c-5em'] : ['c-1a', 'c-2a', 'c-4em'],
      assignedSubjects: selectedRole === 'profesor' ? ['sub-tall-4em', 'sub-maq-5em'] : undefined,
    };

    onLogin(customUser);
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between text-slate-800 p-4 sm:p-6 font-sans">
      {/* Top Header - Institutional Banner */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-2 border-b-2 border-slate-300 pb-3 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img
            src="/assets/aistudio/cassa-sn-fondo_ebfb5d01.png"
            alt="Escudo Oficial I.P.E.T. N° 247"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
              <span className="whitespace-nowrap">I.P.E.T. N° 247</span>
              <span className="text-[10px] sm:text-xs bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300 whitespace-nowrap">
                Escuela Técnica
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate">
              Ing. Carlos A. Cassaffousth • Sistema de Asistencias
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-md shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Ciclo Lectivo 2026</span>
        </div>
      </div>

      {/* Main Binder Card */}
      <div className="w-full max-w-4xl mx-auto my-6 bg-white border-2 border-slate-300 rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left column: Role description and orientation */}
        <div className="md:col-span-5 bg-[#143254] text-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e4672] text-amber-300 text-xs font-bold mb-4 border border-amber-400/30">
              <BookOpen className="w-3.5 h-3.5" />
              Libro de Aula Digital
            </div>

            <h2 className="text-2xl font-black text-white leading-tight mb-2">
              Ingreso al Registro de Asistencias
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Plataforma escolar para el pase de lista de alumnos, justificaciones médicas y emisión de planillas de asistencia para profesores y preceptores.
            </p>

            {/* Role cards */}
            <div className="space-y-3">
              <div
                onClick={() => setSelectedRole('profesor')}
                className={`p-3.5 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedRole === 'profesor'
                    ? 'bg-[#1b436e] border-amber-400 shadow-md ring-1 ring-amber-400'
                    : 'bg-[#183658] border-slate-600 hover:bg-[#1e436d]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <GraduationCap className="w-4 h-4" />
                    <span>Soy Profesor / Profesora</span>
                  </div>
                  {selectedRole === 'profesor' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  )}
                </div>
                <p className="text-xs text-slate-200">
                  Acceso a las materias y módulos de taller técnico a su cargo. 
                  (No tiene acceso a Asistencia General).
                </p>
              </div>

              <div
                onClick={() => setSelectedRole('preceptor')}
                className={`p-3.5 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedRole === 'preceptor'
                    ? 'bg-[#1b436e] border-amber-400 shadow-md ring-1 ring-amber-400'
                    : 'bg-[#183658] border-slate-600 hover:bg-[#1e436d]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Soy Preceptor / Preceptora</span>
                  </div>
                  {selectedRole === 'preceptor' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  )}
                </div>
                <p className="text-xs text-slate-200">
                  Control general de entrada institucional diaria, justificaciones médicas y libros de regularidad.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-600 text-xs text-slate-300">
            Escuela Técnica I.P.E.T. N° 247 • Turnos Mañana y Tarde
          </div>
        </div>

        {/* Right column: Action selection */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Elija el rol con el que ingresará hoy:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-300">
                <button
                  type="button"
                  onClick={() => setSelectedRole('profesor')}
                  className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedRole === 'profesor'
                      ? 'bg-[#143254] text-white shadow'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Profesor / Cátedra</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('preceptor')}
                  className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedRole === 'preceptor'
                      ? 'bg-[#143254] text-white shadow'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 text-amber-400" />
                  <span>Preceptoría</span>
                </button>
              </div>
            </div>

            {/* Quick Demo profiles */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cuentas de prueba configuradas en el I.P.E.T. N° 247:</span>
                </span>
                <span className="text-[11px] text-slate-500">Toque para entrar</span>
              </div>

              <div className="space-y-2">
                {roleProfiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectDemoProfile(profile)}
                    className="w-full p-2.5 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-[#143254] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                        {profile.name}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Turno {profile.turn} • {profile.role === 'profesor' ? 'Materias de taller y cátedras asignadas' : 'Cursos asignados'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-900 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Entry */}
            <div className="pt-3 border-t border-slate-200">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                O ingresar nombre personalizado:
              </span>

              <form onSubmit={handleCustomLogin} className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    placeholder={
                      selectedRole === 'profesor'
                        ? 'Ej: Ing. Marcelo Rossi'
                        : 'Ej: Prof. Lucas Benítez'
                    }
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-md font-bold text-xs text-white bg-[#24693d] hover:bg-[#1c5531] transition-all flex items-center justify-center gap-2 cursor-pointer shadow border border-emerald-800"
                >
                  <span>Entrar como {selectedRole === 'profesor' ? 'Profesor' : 'Preceptor'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center py-2 text-xs text-slate-500">
        I.P.E.T. N° 247 • Educación Secundaria Técnica • Libro Digital de Aula y Registro de Faltas
      </footer>
    </div>
  );
};
