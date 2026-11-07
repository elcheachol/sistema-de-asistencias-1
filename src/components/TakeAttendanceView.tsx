import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  Users,
  Search,
  Save,
  CheckCheck,
  RotateCcw,
  BookOpen,
  School,
  Info,
  ShieldCheck,
  Lock,
  HelpCircle,
  ClipboardList,
} from 'lucide-react';
import {
  Course,
  Subject,
  AttendanceStatus,
  AttendanceEntry,
  AttendanceSheet,
  UserProfile,
} from '../types';
import {
  getAvailableCoursesForUser,
  getAvailableSubjectsForUser,
  getStudentsByCourse,
  findAttendanceSheet,
  saveAttendanceSheet,
} from '../services/storage';
import { studentMatchesQuery } from '../utils/textUtils';

interface TakeAttendanceViewProps {
  currentUser: UserProfile;
  onSavedSuccess?: () => void;
  onGoToMonthlyReport?: (courseId: string, month: number, year: number) => void;
  initialCourseId?: string;
  initialDate?: string;
}

export const TakeAttendanceView: React.FC<TakeAttendanceViewProps> = ({
  currentUser,
  onSavedSuccess,
  onGoToMonthlyReport,
  initialCourseId,
  initialDate,
}) => {
  const isTeacher = currentUser.role === 'profesor';

  const getTodayStr = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const availableCourses = useMemo(() => {
    return getAvailableCoursesForUser(currentUser);
  }, [currentUser]);

  const [selectedDate, setSelectedDate] = useState<string>(initialDate || getTodayStr());

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    if (initialCourseId && availableCourses.some(c => c.id === initialCourseId)) {
      return initialCourseId;
    }
    return availableCourses.length > 0 ? availableCourses[0].id : '';
  });

  // PRECEPTOR: Strictly receives only 'sub-general' (Asistencia General).
  // PROFESOR: Strictly receives only their assigned curricular subjects.
  const availableSubjects = useMemo(() => {
    if (!selectedCourseId) return [];
    return getAvailableSubjectsForUser(currentUser, selectedCourseId);
  }, [currentUser, selectedCourseId]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classHour, setClassHour] = useState('1° y 2° Módulo (07:30 a 09:00)');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [existingRecordNotice, setExistingRecordNotice] = useState(false);
  const [showTeacherHelp, setShowTeacherHelp] = useState(false);

  const students = useMemo(() => {
    if (!selectedCourseId) return [];
    return getStudentsByCourse(selectedCourseId);
  }, [selectedCourseId]);

  // Check if Preceptoría recorded morning absences (for teachers)
  const preceptorMorningAbsences = useMemo(() => {
    if (!selectedCourseId || !selectedDate) return new Set<string>();
    const morningSheet = findAttendanceSheet(selectedDate, selectedCourseId, 'sub-general');
    if (!morningSheet) return new Set<string>();
    const absentIds = new Set<string>();
    morningSheet.entries.forEach(e => {
      if (e.status === 'ausente') absentIds.add(e.studentId);
    });
    return absentIds;
  }, [selectedDate, selectedCourseId]);

  useEffect(() => {
    if (availableSubjects.length > 0) {
      const currentValid = availableSubjects.find(s => s.id === selectedSubjectId);
      if (!currentValid) {
        setSelectedSubjectId(availableSubjects[0].id);
      }
    } else {
      setSelectedSubjectId('');
    }
  }, [availableSubjects, selectedSubjectId]);

  const [entries, setEntries] = useState<Record<string, { status: AttendanceStatus; observation: string }>>({});

  useEffect(() => {
    if (!selectedCourseId || !selectedDate || !selectedSubjectId) return;

    const existingSheet = findAttendanceSheet(selectedDate, selectedCourseId, selectedSubjectId);
    const initialEntries: Record<string, { status: AttendanceStatus; observation: string }> = {};

    if (existingSheet && existingSheet.entries.length > 0) {
      setExistingRecordNotice(true);
      setGeneralNotes(existingSheet.notes || '');

      students.forEach(st => {
        const savedEntry = existingSheet.entries.find(e => e.studentId === st.id);
        if (savedEntry) {
          initialEntries[st.id] = {
            status: savedEntry.status,
            observation: savedEntry.observation || '',
          };
        } else {
          initialEntries[st.id] = { status: 'presente', observation: '' };
        }
      });
    } else {
      setExistingRecordNotice(false);
      students.forEach(st => {
        initialEntries[st.id] = { status: 'presente', observation: '' };
      });
    }

    setEntries(initialEntries);
  }, [selectedDate, selectedCourseId, selectedSubjectId, students]);

  const currentCourse = availableCourses.find(c => c.id === selectedCourseId);
  const currentSubject = availableSubjects.find(s => s.id === selectedSubjectId);

  const counts = useMemo(() => {
    let p = 0;
    let a = 0;
    let j = 0;
    let t = 0;
    Object.values(entries).forEach(e => {
      if (e.status === 'presente') p++;
      else if (e.status === 'ausente') a++;
      else if (e.status === 'justificado') j++;
      else if (e.status === 'tardanza') t++;
    });
    const total = students.length;
    const rate = total > 0 ? Math.round(((p + j) / total) * 100) : 100;
    return { p, a, j, t, total, rate };
  }, [entries, students.length]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; observation: string }> = {};
    students.forEach(st => {
      updated[st.id] = {
        status: 'presente',
        observation: entries[st.id]?.observation || '',
      };
    });
    setEntries(updated);
  };

  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setEntries(prev => ({
      ...prev,
      [studentId]: {
        status,
        observation: prev[studentId]?.observation || '',
      },
    }));
  };

  const handleSetStudentObservation = (studentId: string, observation: string) => {
    setEntries(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'presente',
        observation,
      },
    }));
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    return students.filter(st => studentMatchesQuery(st, searchTerm));
  }, [students, searchTerm]);

  const handleSaveAttendance = () => {
    if (!selectedCourseId || !selectedDate || !selectedSubjectId) {
      alert('Por favor verifique que haya seleccionado fecha y curso.');
      return;
    }

    const entryList: AttendanceEntry[] = students.map(st => ({
      studentId: st.id,
      status: entries[st.id]?.status || 'presente',
      observation: entries[st.id]?.observation?.trim() || undefined,
    }));

    const sheetId = `sheet-${selectedDate}-${selectedCourseId}-${selectedSubjectId}`;

    const sheet: AttendanceSheet = {
      id: sheetId,
      date: selectedDate,
      courseId: selectedCourseId,
      subjectId: selectedSubjectId,
      turn: currentCourse?.turn || 'Mañana',
      takenByUserId: currentUser.id,
      takenByUserName: currentUser.name,
      takenByRole: currentUser.role,
      entries: entryList,
      timestamp: new Date().toISOString(),
      notes: generalNotes.trim() ? `${classHour} - ${generalNotes.trim()}` : classHour,
    };

    saveAttendanceSheet(sheet);
    setExistingRecordNotice(true);
    setIsSavedRecently(true);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    if (onSavedSuccess) {
      onSavedSuccess();
    }

    setTimeout(() => {
      setIsSavedRecently(false);
    }, 4500);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Section - Fully responsive school binder card */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/cassa-sn-fondo_ebfb5d01.png"
                alt="Escudo I.P.E.T. N° 247"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  {isTeacher ? 'Módulo Profesor' : 'Módulo Preceptoría'}
                </span>
                <span className="text-[10px] sm:text-xs text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 truncate">
                  I.P.E.T. N° 247
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1 truncate">
                {isTeacher ? 'Asistencia de Cátedra / Taller' : 'Asistencia General de Entrada'}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 truncate">
                {isTeacher ? (
                  <span>Docente: <strong>{currentUser.name}</strong> • Registro de materias asignadas</span>
                ) : (
                  <span>Preceptor: <strong>{currentUser.name}</strong> • Registro diario general del curso</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowTeacherHelp(!showTeacherHelp)}
              className="text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>{showTeacherHelp ? 'Ocultar' : 'Orientaciones'}</span>
            </button>

            <button
              onClick={handleSaveAttendance}
              className="bg-[#24693d] hover:bg-[#1c5531] text-white font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-xs flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer border border-emerald-800 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>

        {/* Collapsible Orientative Box */}
        {showTeacherHelp && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-800 space-y-1.5">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Normativa y Roles de Asistencia I.P.E.T. N° 247:</span>
            </div>
            <p className="text-[11px] text-slate-700">
              • <strong>Preceptores:</strong> Tienen a su cargo exclusivamente la <em>Asistencia General Institucional</em> (entrada diaria del curso para el libro matriz). No marcan materias individuales.
            </p>
            <p className="text-[11px] text-slate-700">
              • <strong>Profesores:</strong> Tienen a su cargo exclusivamente la asistencia de sus <em>materias y módulos de taller técnico</em> asignados. No tienen acceso a la asistencia general.
            </p>
            <p className="text-[11px] text-slate-700">
              • <strong>Marcas:</strong> [P] Presente, [A] Ausente injustificado (1 falta), [J] Justificado (con certificado), [T] Tardanza pasados 15 min (0.5 falta).
            </p>
          </div>
        )}

        {/* Informative Role Banner */}
        <div className="mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 border bg-slate-50 border-slate-300 text-slate-800">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            {isTeacher ? (
              <span><strong>Restricción activa:</strong> Como profesor, usted asienta la asistencia de sus materias a cargo. La Asistencia General corresponde a Preceptoría.</span>
            ) : (
              <span><strong>Función de Preceptoría:</strong> Usted asienta la Asistencia General del curso. La asistencia de materias corresponde a los profesores.</span>
            )}
          </span>
        </div>

        {/* Saved Success Notice */}
        {isSavedRecently && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-400 rounded-lg flex items-center justify-between text-xs text-emerald-950">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ¡Asistencia guardada correctamente!
            </span>
            {onGoToMonthlyReport && (
              <button
                onClick={() => {
                  const parts = selectedDate.split('-');
                  onGoToMonthlyReport(selectedCourseId, parseInt(parts[1], 10), parseInt(parts[0], 10));
                }}
                className="underline font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer ml-2"
              >
                Ver Planilla Mensual →
              </button>
            )}
          </div>
        )}

        {existingRecordNotice && (
          <div className="mt-2.5 p-2 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Ya existe registro para este día y curso. Al presionar Guardar se actualizará.</span>
          </div>
        )}
      </div>

      {/* Selectors Card - Fully Responsive 1 to 3 columns */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <School className="w-4 h-4 text-slate-600 shrink-0" />
          <span>Datos de la Clase / Jornada</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1. Fecha */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>1. Fecha:</span>
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayStr())}
                className="text-[11px] text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                Hoy
              </button>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded py-1.5 px-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* 2. Curso */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              2. Curso / División:
            </label>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded py-1.5 px-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            >
              {availableCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} {course.specialty ? `- ${course.specialty}` : ''} ({course.turn})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Materia: STRICT SEPARATION */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>3. Materia / Cátedra:</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                isTeacher ? 'text-blue-900 bg-blue-100 border-blue-300' : 'text-amber-900 bg-amber-100 border-amber-300'
              }`}>
                {isTeacher ? 'Profesor' : 'Preceptoría'}
              </span>
            </label>

            {/* PRECEPTOR: FIXED to Asistencia General, NO OTHER SUBJECTS */}
            {!isTeacher ? (
              <div className="bg-white border border-slate-300 rounded py-1.5 px-2 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="truncate">Asistencia General (Preceptoría / Entrada)</span>
                <span title="Fijado: Preceptoría solo asienta asistencia general" className="inline-flex shrink-0 ml-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                </span>
              </div>
            ) : (
              /* PROFESSOR: ONLY curricular subjects */
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded py-1.5 px-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
              >
                {availableSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}

            <p className="text-[10px] text-slate-600 mt-1">
              {!isTeacher
                ? 'Preceptor: Control de entrada general del curso.'
                : 'Profesor: Solo se muestran sus materias asignadas.'}
            </p>
          </div>
        </div>

        {/* Schedule & Notes */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Módulo / Horario:
            </label>
            <select
              value={classHour}
              onChange={e => setClassHour(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded py-1 px-2 text-xs text-slate-800"
            >
              <option value="1° y 2° Módulo (07:30 a 09:00)">1° y 2° Módulo (07:30 a 09:00)</option>
              <option value="3° y 4° Módulo (09:15 a 10:45)">3° y 4° Módulo (09:15 a 10:45)</option>
              <option value="5° y 6° Módulo (11:00 a 12:30)">5° y 6° Módulo (11:00 a 12:30)</option>
              <option value="Jornada de Taller Técnico">Jornada de Taller Técnico</option>
              <option value="Turno Tarde - Entrada (13:30 a 15:00)">Turno Tarde - Entrada (13:30 a 15:00)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observación de la clase (opcional):
            </label>
            <input
              type="text"
              placeholder="Ej: Práctica de pañol, evaluación, paro de transporte..."
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded py-1 px-2 text-xs text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Metric Counters - Responsive Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <div className="bg-white border border-slate-300 p-2 rounded-lg text-center">
          <div className="text-[10px] font-bold text-slate-600 uppercase">Total</div>
          <div className="text-lg font-black text-slate-900">{counts.total}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-lg text-center">
          <div className="text-[10px] font-bold text-emerald-900 uppercase">Presentes</div>
          <div className="text-lg font-black text-emerald-700">{counts.p}</div>
        </div>
        <div className="bg-rose-50 border border-rose-300 p-2 rounded-lg text-center">
          <div className="text-[10px] font-bold text-rose-900 uppercase">Ausentes</div>
          <div className="text-lg font-black text-rose-700">{counts.a}</div>
        </div>
        <div className="bg-sky-50 border border-sky-300 p-2 rounded-lg text-center">
          <div className="text-[10px] font-bold text-sky-900 uppercase">Justif.</div>
          <div className="text-lg font-black text-sky-700">{counts.j}</div>
        </div>
        <div className="bg-amber-50 border border-amber-300 p-2 rounded-lg text-center">
          <div className="text-[10px] font-bold text-amber-900 uppercase">Tardanzas</div>
          <div className="text-lg font-black text-amber-700">{counts.t}</div>
        </div>
        <div className="bg-slate-50 border border-slate-300 p-2 rounded-lg text-center">
          <div className="text-[10px] font-bold text-slate-700 uppercase">% Asist.</div>
          <div className="text-lg font-black text-slate-900">{counts.rate}%</div>
        </div>
      </div>

      {/* Roster Table - Smooth Mobile Horizontal Scroll & Touch Buttons */}
      <div className="bg-white border-2 border-slate-300 rounded-xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3 bg-slate-100 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por apellido o DNI (sin tildes)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded py-1 pl-8 pr-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="bg-[#24693d] hover:bg-[#1c5531] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
              title="Marcar todos los alumnos como presentes"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>✓ Todos Presentes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const updated: Record<string, { status: AttendanceStatus; observation: string }> = {};
                students.forEach(st => {
                  updated[st.id] = { status: 'ausente', observation: '' };
                });
                setEntries(updated);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-1.5 rounded text-xs font-semibold cursor-pointer border border-slate-300"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-700 flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-900">Marcas:</span>
          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px]">P</span>
            Presente
          </span>
          <span className="inline-flex items-center gap-1 text-rose-800 font-bold">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 text-white flex items-center justify-center text-[9px]">A</span>
            Ausente (1 falta)
          </span>
          <span className="inline-flex items-center gap-1 text-sky-800 font-bold">
            <span className="w-3.5 h-3.5 rounded bg-sky-600 text-white flex items-center justify-center text-[9px]">J</span>
            Justificado
          </span>
          <span className="inline-flex items-center gap-1 text-amber-800 font-bold">
            <span className="w-3.5 h-3.5 rounded bg-amber-600 text-white flex items-center justify-center text-[9px]">T</span>
            Tardanza (0.5 falta)
          </span>
        </div>

        {/* Table with Touch Targets */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-900 border-collapse">
            <thead className="bg-[#12263f] text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2 px-2 text-center w-8 border border-[#1c3c63]">#</th>
                <th className="py-2 px-3 min-w-[180px] border border-[#1c3c63]">Estudiante</th>
                <th className="py-2 px-2 text-center w-24 hidden sm:table-cell border border-[#1c3c63]">D.N.I.</th>
                <th className="py-2 px-2 text-center min-w-[150px] border border-[#1c3c63]">Marca</th>
                <th className="py-2 px-2 min-w-[160px] border border-[#1c3c63]">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    No se encontraron estudiantes para este curso.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const entry = entries[student.id] || { status: 'presente', observation: '' };
                  const isMorningAbsent = preceptorMorningAbsences.has(student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        entry.status === 'ausente'
                          ? 'bg-rose-50/70'
                          : entry.status === 'tardanza'
                          ? 'bg-amber-50/70'
                          : entry.status === 'justificado'
                          ? 'bg-sky-50/70'
                          : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                    >
                      <td className="py-2 px-2 text-center font-bold text-slate-500 border-r border-slate-200 text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {student.lastName}, {student.firstName}
                        </div>
                        {isTeacher && isMorningAbsent && (
                          <div className="text-[10px] text-rose-700 font-bold mt-0.5">
                            Preceptoría: Ausente en entrada
                          </div>
                        )}
                      </td>

                      <td className="py-2 px-2 text-center font-mono text-xs text-slate-600 hidden sm:table-cell border-r border-slate-200">
                        {student.dni}
                      </td>

                      {/* State buttons with comfortable mobile touch zone */}
                      <td className="py-2 px-2 text-center border-r border-slate-200">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-300">
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student.id, 'presente')}
                            className={`w-7 h-7 rounded text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                              entry.status === 'presente'
                                ? 'bg-[#24693d] text-white shadow ring-2 ring-emerald-500'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                            title="Presente"
                          >
                            P
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student.id, 'ausente')}
                            className={`w-7 h-7 rounded text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                              entry.status === 'ausente'
                                ? 'bg-rose-600 text-white shadow ring-2 ring-rose-500'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                            title="Ausente"
                          >
                            A
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student.id, 'justificado')}
                            className={`w-7 h-7 rounded text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                              entry.status === 'justificado'
                                ? 'bg-sky-600 text-white shadow ring-2 ring-sky-500'
                                : 'text-slate-600 hover:text-sky-700'
                            }`}
                            title="Justificado"
                          >
                            J
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student.id, 'tardanza')}
                            className={`w-7 h-7 rounded text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                              entry.status === 'tardanza'
                                ? 'bg-amber-600 text-white shadow ring-2 ring-amber-500'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                            title="Tardanza"
                          >
                            T
                          </button>
                        </div>
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          placeholder={
                            entry.status === 'ausente'
                              ? 'Motivo...'
                              : entry.status === 'tardanza'
                              ? 'Hora llegada...'
                              : entry.status === 'justificado'
                              ? 'Certificado médico...'
                              : 'Observación...'
                          }
                          value={entry.observation}
                          onChange={e => handleSetStudentObservation(student.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Action */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between">
          <span className="text-[11px] text-slate-600 truncate">
            {currentUser.name} ({isTeacher ? 'Profesor/a' : 'Preceptor/a'})
          </span>

          <button
            type="button"
            onClick={handleSaveAttendance}
            className="bg-[#24693d] hover:bg-[#1c5531] text-white font-bold px-4 py-1.5 rounded text-xs shadow-xs cursor-pointer border border-emerald-800 active:scale-95"
          >
            Guardar Asistencias
          </button>
        </div>
      </div>
    </div>
  );
};
