import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  School,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  FileDown,
  Info,
  Search,
} from 'lucide-react';
import { Course, Subject, UserProfile, StudentMonthlySummary } from '../types';
import {
  getCourses,
  getSubjectsForCourse,
  getAvailableCoursesForUser,
  getAvailableSubjectsForUser,
  calculateMonthlyReport,
} from '../services/storage';
import {
  exportMonthlyReportToExcel,
  exportMonthlyReportToCSV,
} from '../services/exportService';
import { studentMatchesQuery } from '../utils/textUtils';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface MonthlyReportViewProps {
  currentUser: UserProfile;
  initialCourseId?: string;
  initialMonth?: number;
  initialYear?: number;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  currentUser,
  initialCourseId,
  initialMonth = 11, // Defaults to November
  initialYear = 2026,
}) => {
  const isTeacher = currentUser.role === 'profesor';

  const courses = useMemo(() => {
    return getCourses();
  }, []);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || (courses.length > 0 ? courses[0].id : '')
  );

  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    isTeacher ? 'all' : 'sub-general'
  );
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentMonthlySummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Available subjects for selected course based on role
  const subjects = useMemo(() => {
    if (!selectedCourseId) return [];
    if (isTeacher) {
      return getAvailableSubjectsForUser(currentUser, selectedCourseId);
    }
    return getSubjectsForCourse(selectedCourseId);
  }, [selectedCourseId, isTeacher, currentUser]);

  const currentCourse = courses.find(c => c.id === selectedCourseId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Monthly calculation
  const reportData = useMemo(() => {
    if (!selectedCourseId) {
      return { studentsSummary: [], schoolDaysWithData: [], totalClasses: 0 };
    }
    return calculateMonthlyReport(
      selectedCourseId,
      selectedYear,
      selectedMonth,
      selectedSubjectId
    );
  }, [selectedCourseId, selectedYear, selectedMonth, selectedSubjectId]);

  const { studentsSummary, schoolDaysWithData, totalClasses } = reportData;

  // Filter summaries by student name/DNI without accents
  const displayedSummaries = useMemo(() => {
    if (!searchTerm.trim()) return studentsSummary;
    return studentsSummary.filter(s => studentMatchesQuery(s.student, searchTerm));
  }, [studentsSummary, searchTerm]);

  const overallStats = useMemo(() => {
    const totalStudents = studentsSummary.length;
    if (totalStudents === 0) {
      return { avgAttendance: 0, criticalCount: 0, warningCount: 0, totalAbsences: 0 };
    }
    const sumRate = studentsSummary.reduce((acc, curr) => acc + curr.porcentajeAsistencia, 0);
    const avgAttendance = Math.round(sumRate / totalStudents);
    const criticalCount = studentsSummary.filter(s => s.alertaFaltas === 'critico').length;
    const warningCount = studentsSummary.filter(s => s.alertaFaltas === 'advertencia').length;
    const totalAbsences = studentsSummary.reduce(
      (acc, curr) => acc + curr.totalFaltasComputadas,
      0
    );

    return { avgAttendance, criticalCount, warningCount, totalAbsences };
  }, [studentsSummary]);

  const handleExportExcel = () => {
    if (!currentCourse) return;
    exportMonthlyReportToExcel({
      course: currentCourse,
      subject: currentSubject,
      monthName: MONTH_NAMES[selectedMonth - 1],
      year: selectedYear,
      daysWithData: schoolDaysWithData,
      summaries: studentsSummary,
      institutionName: 'Escuela Técnica I.P.E.T. N° 247',
    });
  };

  const handleExportCSV = () => {
    if (!currentCourse) return;
    exportMonthlyReportToCSV({
      course: currentCourse,
      subject: currentSubject,
      monthName: MONTH_NAMES[selectedMonth - 1],
      year: selectedYear,
      daysWithData: schoolDaysWithData,
      summaries: studentsSummary,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Institutional Binder Header */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start gap-3">
          <img
            src="/assets/aistudio/cassa-sn-fondo_ebfb5d01.png"
            alt="Escudo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-xs shrink-0"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#102a45] text-amber-300 text-xs font-bold mb-1 border border-amber-400/30">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Planilla Matriz Oficial • I.P.E.T. N° 247</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Reporte Mensual de Asistencias
            </h1>
            <p className="text-xs text-slate-700 mt-0.5 max-w-2xl">
              Cuadrícula diaria de asistencias e inasistencias con cómputo de faltas, porcentaje de presentismo y seguimiento institucional.
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-[#24693d] hover:bg-[#1c5531] text-white font-bold px-3.5 py-2 rounded-lg shadow text-xs sm:text-sm cursor-pointer transition-all active:scale-95 border border-emerald-800 flex items-center gap-1.5"
            title="Descargar archivo Excel (.xlsx) estructurado"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Descargar Excel (.XLSX)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm cursor-pointer flex items-center gap-1.5"
            title="Exportar archivo CSV estándar"
          >
            <FileDown className="w-4 h-4 text-slate-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#143254] hover:bg-[#0e243d] text-white font-bold px-3.5 py-2 rounded-lg border border-[#143254] text-xs sm:text-sm cursor-pointer flex items-center gap-1.5 shadow"
            title="Imprimir planilla para la carpeta física"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Selectors Bar */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Curso */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-slate-600" />
              Curso / División:
            </label>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 px-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.specialty ? `- ${c.specialty}` : ''} ({c.turn})
                </option>
              ))}
            </select>
          </div>

          {/* Mes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              Mes a consultar:
            </label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 px-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Año */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              Año Lectivo:
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 px-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            >
              <option value={2026}>2026 (Actual)</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* Materia */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              Materia / Cátedra:
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 px-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            >
              {!isTeacher ? (
                <>
                  <option value="sub-general">Asistencia General (Preceptoría / Entrada)</option>
                  <option value="all">Todas las asistencias acumuladas</option>
                </>
              ) : (
                <>
                  <option value="all">Todas mis materias en este curso</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block mb-6 p-4 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase">
              Escuela de Educación Secundaria Técnica I.P.E.T. N° 247
            </h1>
            <h2 className="text-sm font-semibold">
              PLANILLA MENSUAL DE ASISTENCIA Y CONTROL DE REGULARIDAD
            </h2>
          </div>
          <div className="text-right text-xs">
            <div>Mes: <strong>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong></div>
            <div>Curso: <strong>{currentCourse?.name} ({currentCourse?.specialty})</strong></div>
            <div>Turno: <strong>{currentCourse?.turn}</strong></div>
          </div>
        </div>
      </div>

      {/* Indicators ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white border-2 border-slate-300 p-3 rounded-lg shadow-xs">
          <div className="text-[11px] font-bold text-slate-700 uppercase">Asistencia Promedio</div>
          <div className="text-2xl font-black text-slate-900">{overallStats.avgAttendance}%</div>
          <p className="text-[10px] text-slate-600">Promedio general mensual</p>
        </div>

        <div className="bg-white border-2 border-slate-300 p-3 rounded-lg shadow-xs">
          <div className="text-[11px] font-bold text-slate-700 uppercase">Días con Clases</div>
          <div className="text-2xl font-black text-slate-900">{totalClasses}</div>
          <p className="text-[10px] text-slate-600">Jornadas registradas en el mes</p>
        </div>

        <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-lg shadow-xs">
          <div className="text-[11px] font-bold text-amber-900 uppercase">En Advertencia (18-24)</div>
          <div className="text-2xl font-black text-amber-800">{overallStats.warningCount}</div>
          <p className="text-[10px] text-amber-900">Alumnos en seguimiento</p>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 p-3 rounded-lg shadow-xs">
          <div className="text-[11px] font-bold text-rose-900 uppercase">Condición Libre (≥25)</div>
          <div className="text-2xl font-black text-rose-800">{overallStats.criticalCount}</div>
          <p className="text-[10px] text-rose-900">Alumnos en condición libre</p>
        </div>
      </div>

      {/* Monthly Attendance Table - Paper School Matrix Style */}
      <div className="bg-white border-2 border-slate-300 rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-100 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Filtrar alumno (sin tildes ni mayúsculas)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded py-1 pl-8 pr-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <span className="text-xs text-slate-600 font-semibold hidden md:inline">
              {displayedSummaries.length} de {studentsSummary.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold self-end sm:self-auto">
            <span className="inline-flex items-center gap-1 text-emerald-800">
              <span className="w-3.5 h-3.5 bg-emerald-700 text-white flex items-center justify-center rounded text-[9px] font-bold">P</span>
              Presente
            </span>
            <span className="inline-flex items-center gap-1 text-rose-800">
              <span className="w-3.5 h-3.5 bg-rose-700 text-white flex items-center justify-center rounded text-[9px] font-bold">A</span>
              Ausente
            </span>
            <span className="inline-flex items-center gap-1 text-sky-800">
              <span className="w-3.5 h-3.5 bg-sky-700 text-white flex items-center justify-center rounded text-[9px] font-bold">J</span>
              Justif.
            </span>
            <span className="inline-flex items-center gap-1 text-amber-800">
              <span className="w-3.5 h-3.5 bg-amber-700 text-white flex items-center justify-center rounded text-[9px] font-bold">T</span>
              Tardanza
            </span>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-900 border-collapse">
            <thead className="bg-[#12263f] text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2 px-1 text-center w-8 border border-[#1c3c63]">N°</th>
                <th className="py-2 px-2.5 min-w-[190px] border border-[#1c3c63]">Apellido y Nombre</th>
                <th className="py-2 px-2 text-center w-24 hidden md:table-cell border border-[#1c3c63]">D.N.I.</th>

                {/* Daily columns */}
                {schoolDaysWithData.length === 0 ? (
                  <th className="py-2 px-3 text-center text-slate-300 font-normal border border-[#1c3c63]">
                    Sin registros para este mes
                  </th>
                ) : (
                  schoolDaysWithData.map(day => (
                    <th
                      key={day}
                      className="py-2 px-1 text-center font-bold text-amber-300 w-7 border border-[#1c3c63]"
                      title={`Día ${day}`}
                    >
                      {day}
                    </th>
                  ))
                )}

                {/* Summary columns */}
                <th className="py-2 px-1.5 text-center bg-[#1a385c] text-emerald-300 font-bold border border-[#1c3c63]" title="Total Presentes">
                  P
                </th>
                <th className="py-2 px-1.5 text-center bg-[#1a385c] text-rose-300 font-bold border border-[#1c3c63]" title="Total Ausentes">
                  A
                </th>
                <th className="py-2 px-1.5 text-center bg-[#1a385c] text-sky-300 font-bold border border-[#1c3c63]" title="Total Justificados">
                  J
                </th>
                <th className="py-2 px-1.5 text-center bg-[#1a385c] text-amber-300 font-bold border border-[#1c3c63]" title="Total Tardanzas">
                  T
                </th>
                <th className="py-2 px-2 text-center bg-[#0d1e33] text-white font-black border border-[#1c3c63]" title="Faltas Computadas: A + 0.5*T">
                  Tot. Faltas
                </th>
                <th className="py-2 px-2 text-center bg-[#0d1e33] text-amber-300 font-bold border border-[#1c3c63]">
                  % Asist.
                </th>
                <th className="py-2 px-2 text-center bg-[#0d1e33] text-white border border-[#1c3c63] print:hidden">
                  Condición
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {displayedSummaries.length === 0 ? (
                <tr>
                  <td colSpan={schoolDaysWithData.length + 8} className="py-10 text-center text-slate-500 italic">
                    No se encontraron alumnos con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                displayedSummaries.map((summary, idx) => {
                  const { student, dailyStatus, presentes, ausentes, justificados, tardanzas, totalFaltasComputadas, porcentajeAsistencia, alertaFaltas } = summary;

                  return (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudentDetail(summary)}
                      className={`hover:bg-slate-100 cursor-pointer transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      }`}
                    >
                      <td className="py-1.5 px-1 text-center font-bold text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>

                      <td className="py-1.5 px-2.5 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                        {student.lastName}, {student.firstName}
                      </td>

                      <td className="py-1.5 px-2 text-center font-mono text-xs text-slate-600 hidden md:table-cell border-r border-slate-200">
                        {student.dni}
                      </td>

                      {/* Day cells */}
                      {schoolDaysWithData.map(day => {
                        const status = dailyStatus[day];
                        let cellContent = '-';
                        let cellClass = 'text-slate-400 font-normal';

                        if (status === 'presente') {
                          cellContent = 'P';
                          cellClass = 'text-emerald-800 font-black bg-emerald-50';
                        } else if (status === 'ausente') {
                          cellContent = 'A';
                          cellClass = 'text-rose-800 font-black bg-rose-100';
                        } else if (status === 'justificado') {
                          cellContent = 'J';
                          cellClass = 'text-sky-800 font-black bg-sky-50';
                        } else if (status === 'tardanza') {
                          cellContent = 'T';
                          cellClass = 'text-amber-800 font-black bg-amber-50';
                        }

                        return (
                          <td
                            key={day}
                            className={`py-1.5 px-1 text-center font-mono text-xs border-r border-slate-200 ${cellClass}`}
                          >
                            {cellContent}
                          </td>
                        );
                      })}

                      {/* Summary values */}
                      <td className="py-1.5 px-1.5 text-center font-bold text-emerald-800 bg-emerald-50/30 border-r border-slate-200">
                        {presentes}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-bold text-rose-800 bg-rose-50/30 border-r border-slate-200">
                        {ausentes}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-bold text-sky-800 bg-sky-50/30 border-r border-slate-200">
                        {justificados}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-bold text-amber-800 bg-amber-50/30 border-r border-slate-200">
                        {tardanzas}
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-slate-900 bg-slate-100 border-r border-slate-200">
                        {totalFaltasComputadas}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold bg-slate-50 border-r border-slate-200">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[11px] font-bold ${
                            porcentajeAsistencia >= 85
                              ? 'text-emerald-800 bg-emerald-100'
                              : porcentajeAsistencia >= 75
                              ? 'text-amber-800 bg-amber-100'
                              : 'text-rose-800 bg-rose-100'
                          }`}
                        >
                          {porcentajeAsistencia}%
                        </span>
                      </td>

                      {/* Condition badge */}
                      <td className="py-1.5 px-2 text-center print:hidden">
                        {alertaFaltas === 'critico' ? (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                            Libre (≥25)
                          </span>
                        ) : alertaFaltas === 'advertencia' ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            Advertencia
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800">
                            Regular
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Print Signatures */}
        <div className="hidden print:grid grid-cols-3 gap-8 pt-16 pb-8 px-6 text-center text-xs text-slate-800">
          <div className="border-t border-slate-900 pt-2">
            <p className="font-bold">Firma del Preceptor / Docente</p>
            <p className="text-[10px] text-slate-600">Aclaración y D.N.I.</p>
          </div>
          <div className="border-t border-slate-900 pt-2">
            <p className="font-bold">Firma Regencia Técnica</p>
            <p className="text-[10px] text-slate-600">I.P.E.T. N° 247</p>
          </div>
          <div className="border-t border-slate-900 pt-2">
            <p className="font-bold">Firma Dirección</p>
            <p className="text-[10px] text-slate-600">Sello de la Institución</p>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-300 rounded-xl max-w-md w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedStudentDetail(null)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-900 p-1 rounded font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#143254] text-white flex items-center justify-center font-bold text-base">
                {selectedStudentDetail.student.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedStudentDetail.student.lastName}, {selectedStudentDetail.student.firstName}
                </h3>
                <p className="text-xs text-slate-600">
                  DNI: <strong>{selectedStudentDetail.student.dni}</strong> • {currentCourse?.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-emerald-50 border border-emerald-300 p-2 rounded text-center">
                <div className="text-base font-black text-emerald-800">{selectedStudentDetail.presentes}</div>
                <div className="text-[9px] text-emerald-900 font-bold uppercase">Presentes</div>
              </div>
              <div className="bg-rose-50 border border-rose-300 p-2 rounded text-center">
                <div className="text-base font-black text-rose-800">{selectedStudentDetail.ausentes}</div>
                <div className="text-[9px] text-rose-900 font-bold uppercase">Ausentes</div>
              </div>
              <div className="bg-sky-50 border border-sky-300 p-2 rounded text-center">
                <div className="text-base font-black text-sky-800">{selectedStudentDetail.justificados}</div>
                <div className="text-[9px] text-sky-900 font-bold uppercase">Justif.</div>
              </div>
              <div className="bg-amber-50 border border-amber-300 p-2 rounded text-center">
                <div className="text-base font-black text-amber-800">{selectedStudentDetail.tardanzas}</div>
                <div className="text-[9px] text-amber-900 font-bold uppercase">Tardanzas</div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 space-y-1.5 text-xs text-slate-800 mb-4">
              <div className="flex justify-between">
                <span>Total de Inasistencias Computadas:</span>
                <span className="font-bold text-slate-900">{selectedStudentDetail.totalFaltasComputadas} faltas</span>
              </div>
              <div className="flex justify-between">
                <span>Porcentaje de Asistencia:</span>
                <span className="font-bold text-blue-900">{selectedStudentDetail.porcentajeAsistencia}%</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span>Condición Escolar:</span>
                <span className={`font-bold ${
                  selectedStudentDetail.alertaFaltas === 'critico'
                    ? 'text-rose-700'
                    : selectedStudentDetail.alertaFaltas === 'advertencia'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}>
                  {selectedStudentDetail.alertaFaltas === 'critico'
                    ? 'Condición Libre (≥ 25 faltas)'
                    : selectedStudentDetail.alertaFaltas === 'advertencia'
                    ? 'Advertencia preventiva'
                    : 'Regular'}
                </span>
              </div>
            </div>

            {selectedStudentDetail.student.guardianName && (
              <div className="text-xs text-slate-700 bg-slate-100 p-2.5 rounded border border-slate-200 mb-4">
                <span className="font-bold">Contacto de Tutor:</span> {selectedStudentDetail.student.guardianName}
                {selectedStudentDetail.student.guardianPhone && (
                  <span className="block mt-0.5">Teléfono: {selectedStudentDetail.student.guardianPhone}</span>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-1.5 rounded text-xs cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
