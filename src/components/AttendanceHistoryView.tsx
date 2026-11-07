import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  School,
  BookOpen,
  Trash2,
  Edit3,
  Search,
} from 'lucide-react';
import { AttendanceSheet, UserProfile } from '../types';
import {
  getAllAttendanceSheets,
  getCourses,
  getSubjects,
  deleteAttendanceSheet,
} from '../services/storage';
import { normalizeSearchText } from '../utils/textUtils';

interface AttendanceHistoryViewProps {
  currentUser: UserProfile;
  onEditSheet: (sheet: AttendanceSheet) => void;
}

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  currentUser,
  onEditSheet,
}) => {
  const [sheets, setSheets] = useState<AttendanceSheet[]>(() => getAllAttendanceSheets());
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const courses = useMemo(() => getCourses(), []);
  const subjects = useMemo(() => getSubjects(), []);

  const refreshSheets = () => {
    setSheets(getAllAttendanceSheets());
  };

  const filteredSheets = useMemo(() => {
    return sheets.filter(sheet => {
      if (courseFilter !== 'all' && sheet.courseId !== courseFilter) return false;
      if (searchTerm.trim()) {
        const cleanTerm = normalizeSearchText(searchTerm);
        const matchesDate = sheet.date.includes(searchTerm.trim());
        const matchesUser = normalizeSearchText(sheet.takenByUserName).includes(cleanTerm);
        if (!matchesDate && !matchesUser) return false;
      }
      return true;
    });
  }, [sheets, courseFilter, searchTerm]);

  const handleDelete = (sheetId: string) => {
    if (confirm('¿Desea anular este registro de asistencia?')) {
      deleteAttendanceSheet(sheetId);
      refreshSheets();
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <img
            src="/assets/aistudio/cassa-sn-fondo_ebfb5d01.png"
            alt="Escudo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-xs shrink-0"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#102a45] text-amber-300 text-xs font-bold mb-1 border border-amber-400/30">
              <History className="w-3.5 h-3.5" />
              <span>Libro Diario de Asistencias • I.P.E.T. N° 247</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Historial de Planillas Registradas
            </h1>
            <p className="text-xs text-slate-700 mt-0.5 max-w-2xl">
              Histórico de partes de asistencia asentados en el sistema por fecha, curso y cátedra.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Course filter */}
          <div className="w-full sm:w-64">
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 px-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            >
              <option value="all">Todos los Cursos</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.specialty ? `- ${c.specialty}` : ''} ({c.turn})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por fecha (YYYY-MM-DD) o docente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 pl-8 pr-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="text-xs text-slate-700 font-bold self-end md:self-center">
          Registros guardados: {filteredSheets.length}
        </div>
      </div>

      {/* Sheets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSheets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white border-2 border-slate-300 rounded-xl italic">
            No se encontraron registros de asistencias para los criterios indicados.
          </div>
        ) : (
          filteredSheets.map(sheet => {
            const course = courses.find(c => c.id === sheet.courseId);
            const subject = subjects.find(s => s.id === sheet.subjectId);

            let pres = 0;
            let aus = 0;
            let just = 0;
            let tard = 0;

            sheet.entries.forEach(e => {
              if (e.status === 'presente') pres++;
              else if (e.status === 'ausente') aus++;
              else if (e.status === 'justificado') just++;
              else if (e.status === 'tardanza') tard++;
            });

            const total = sheet.entries.length;
            const rate = total > 0 ? Math.round(((pres + just) / total) * 100) : 100;

            return (
              <div
                key={sheet.id}
                className="bg-white border-2 border-slate-300 hover:border-slate-400 rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                      <Calendar className="w-3 h-3 text-blue-700" />
                      {sheet.date}
                    </span>
                    <span className="text-[11px] text-slate-600 font-semibold">
                      Turno {sheet.turn}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {course ? course.name : 'Curso'}
                  </h3>
                  <p className="text-[11px] text-slate-600 mb-1">
                    {course?.specialty || 'General'}
                  </p>

                  <div className="text-xs text-blue-900 font-bold flex items-center gap-1 mb-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                    <span>{subject ? subject.name : 'Asistencia General'}</span>
                  </div>

                  {/* Badges counter */}
                  <div className="grid grid-cols-4 gap-1 py-1.5 px-2 bg-slate-50 rounded border border-slate-200 text-center mb-2 text-xs">
                    <div>
                      <div className="font-bold text-emerald-800">{pres}</div>
                      <div className="text-[9px] text-emerald-950 font-bold uppercase">P</div>
                    </div>
                    <div>
                      <div className="font-bold text-rose-800">{aus}</div>
                      <div className="text-[9px] text-rose-950 font-bold uppercase">A</div>
                    </div>
                    <div>
                      <div className="font-bold text-sky-800">{just}</div>
                      <div className="text-[9px] text-sky-950 font-bold uppercase">J</div>
                    </div>
                    <div>
                      <div className="font-bold text-amber-800">{tard}</div>
                      <div className="text-[9px] text-amber-950 font-bold uppercase">T</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    Docente: <strong className="text-slate-800">{sheet.takenByUserName}</strong> ({sheet.takenByRole})
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Asistencia: <span className="text-blue-900">{rate}%</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditSheet(sheet)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Ver / Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(sheet.id)}
                      title="Eliminar registro"
                      className="text-slate-400 hover:text-rose-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
