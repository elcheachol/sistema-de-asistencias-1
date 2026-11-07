import React, { useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Users,
  School,
  BookOpen,
  Info,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { UserProfile, Course, Subject } from '../types';
import {
  getCourses,
  getSubjects,
  getAvailableCoursesForUser,
  getAvailableSubjectsForUser,
  getAllAttendanceSheets,
  getStudents,
} from '../services/storage';

interface DashboardViewProps {
  currentUser: UserProfile;
  onOpenTakeAttendance: (courseId?: string) => void;
  onGoToMonthlyReport: (courseId?: string) => void;
  onGoToStudents: (courseId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onOpenTakeAttendance,
  onGoToMonthlyReport,
  onGoToStudents,
}) => {
  const isTeacher = currentUser.role === 'profesor';

  const courses = useMemo(() => getCourses(), []);
  const allSheets = useMemo(() => getAllAttendanceSheets(), []);
  const allStudents = useMemo(() => getStudents(), []);

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // For teachers: their assigned courses
  const teacherCourses = useMemo(() => {
    return getAvailableCoursesForUser(currentUser);
  }, [currentUser]);

  // List of teacher's specific cátedras
  const teacherCatedras = useMemo(() => {
    if (!isTeacher) return [];
    const subjectsForTeacher: { course: Course; subject: Subject }[] = [];

    teacherCourses.forEach(course => {
      const subs = getAvailableSubjectsForUser(currentUser, course.id);
      subs.forEach(s => {
        subjectsForTeacher.push({ course, subject: s });
      });
    });

    return subjectsForTeacher;
  }, [isTeacher, currentUser, teacherCourses]);

  // Status cards for today's classes
  const todayStatusCards = useMemo(() => {
    if (isTeacher) {
      return teacherCatedras.map(({ course, subject }) => {
        const sheet = allSheets.find(
          s => s.date === todayStr && s.courseId === course.id && s.subjectId === subject.id
        );
        const courseStudents = allStudents.filter(st => st.courseId === course.id);

        if (!sheet) {
          return {
            title: subject.name,
            courseName: course.name,
            specialty: course.specialty,
            courseId: course.id,
            subjectId: subject.id,
            status: 'pending' as const,
            totalStudents: courseStudents.length,
            presentes: 0,
            ausentes: 0,
          };
        }

        let pres = 0;
        let aus = 0;
        sheet.entries.forEach(e => {
          if (e.status === 'presente') pres++;
          else if (e.status === 'ausente') aus++;
        });

        return {
          title: subject.name,
          courseName: course.name,
          specialty: course.specialty,
          courseId: course.id,
          subjectId: subject.id,
          status: 'completed' as const,
          totalStudents: courseStudents.length,
          presentes: pres,
          ausentes: aus,
        };
      });
    }

    // For Preceptors: ONLY General Attendance
    return courses.map(course => {
      const sheet = allSheets.find(
        s => s.date === todayStr && s.courseId === course.id && s.subjectId === 'sub-general'
      );
      const courseStudents = allStudents.filter(st => st.courseId === course.id);

      if (!sheet) {
        return {
          title: `Asistencia General - ${course.name}`,
          courseName: course.name,
          specialty: course.specialty,
          courseId: course.id,
          subjectId: 'sub-general',
          status: 'pending' as const,
          totalStudents: courseStudents.length,
          presentes: 0,
          ausentes: 0,
        };
      }

      let pres = 0;
      let aus = 0;
      sheet.entries.forEach(e => {
        if (e.status === 'presente') pres++;
        else if (e.status === 'ausente') aus++;
      });

      return {
        title: `Asistencia General - ${course.name}`,
        courseName: course.name,
        specialty: course.specialty,
        courseId: course.id,
        subjectId: 'sub-general',
        status: 'completed' as const,
        totalStudents: courseStudents.length,
        presentes: pres,
        ausentes: aus,
      };
    });
  }, [isTeacher, teacherCatedras, courses, allSheets, allStudents, todayStr]);

  const completedCount = todayStatusCards.filter(c => c.status === 'completed').length;
  const pendingCount = todayStatusCards.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner - Clean institutional summary without redundant buttons */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#102a45] text-amber-300 font-bold text-xs border border-amber-400/30">
              <img
                src="/assets/aistudio/cassa-sn-fondo_ebfb5d01.png"
                alt="Escudo"
                className="w-4 h-4 object-contain shrink-0"
              />
              <span>I.P.E.T. N° 247 • Turno {currentUser.turn}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
              Panel de {currentUser.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
              {isTeacher ? (
                <span>
                  Registro de cátedra: gestione la asistencia de sus alumnos en sus <strong>materias y talleres técnicos asignados</strong>.
                </span>
              ) : (
                <span>
                  Control de Preceptoría: registre la <strong>asistencia general diaria</strong> del curso para el libro matriz de entrada.
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-600 font-medium pt-1">
              <span className="flex items-center gap-1 font-semibold text-blue-900">
                <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                Fecha: {todayStr}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-900">
                <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                {allStudents.length} Alumnos en nómina
              </span>
            </div>
          </div>

          {/* Direct link to monthly reports without duplicating the top Añadir button */}
          <div className="flex items-center self-start md:self-auto shrink-0">
            <button
              onClick={() => onGoToMonthlyReport()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-lg border border-slate-300 flex items-center gap-1.5 text-xs cursor-pointer transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
              <span>Ver Planillas Mensuales</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course / Subject Roster Overview */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#143254] shrink-0" />
              <span>
                {isTeacher
                  ? 'Sus Materias y Cátedras Asignadas'
                  : 'Cursos del Turno (Asistencia General de Preceptoría)'}
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {isTeacher
                ? 'Haga clic en cualquiera de sus cátedras para asentar o editar la lista del día.'
                : 'Haga clic en un curso para cargar la asistencia general diaria.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {completedCount} Listos
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              {pendingCount} Pendientes
            </span>
          </div>
        </div>

        {/* Clean, Non-Redundant Status Cards (click on card to open) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {todayStatusCards.map((item, idx) => {
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={idx}
                onClick={() => onOpenTakeAttendance(item.courseId)}
                className={`p-3.5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-500'
                    : 'bg-white border-slate-300 hover:border-[#143254] hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {item.courseName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isCompleted ? '✓ Asentado' : 'Pendiente hoy'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 leading-snug group-hover:text-blue-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.specialty || 'Ciclo Básico'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  {isCompleted ? (
                    <span className="text-emerald-800 font-bold text-[11px]">
                      {item.presentes} Pres. • {item.ausentes} Aus.
                    </span>
                  ) : (
                    <span className="text-amber-800 font-medium text-[11px]">
                      {item.totalStudents} Alumnos sin marcar
                    </span>
                  )}

                  <span className="text-slate-500 group-hover:text-blue-900 font-bold text-[11px] flex items-center gap-0.5">
                    <span>{isCompleted ? 'Revisar' : 'Cargar'}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informative School Tips Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border-2 border-slate-300 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs mb-1">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>Cómputo de Faltas Escolares</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Inasistencia injustificada: 1 falta. Tardanza: 0.5 falta. Las justificaciones requieren certificado médico o constancia autorizada por Preceptoría.
          </p>
        </div>

        <div className="bg-white border-2 border-slate-300 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs mb-1">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Planillas Oficiales del I.P.E.T. N° 247</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Descargue en Excel (.XLSX) o imprima el formulario mensual oficial con espacios para firmas reglamentarias de Preceptoría y Dirección.
          </p>
        </div>
      </div>
    </div>
  );
};
