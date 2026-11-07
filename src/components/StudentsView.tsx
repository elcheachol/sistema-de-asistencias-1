import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Trash2,
  Phone,
  School,
  UserPlus,
} from 'lucide-react';
import { Student, Course, UserProfile } from '../types';
import {
  getCourses,
  getStudents,
  saveStudent,
  deleteStudent,
} from '../services/storage';
import { studentMatchesQuery } from '../utils/textUtils';

interface StudentsViewProps {
  currentUser: UserProfile;
  initialCourseId?: string;
  onTakeAttendanceForCourse?: (courseId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  currentUser,
  initialCourseId,
  onTakeAttendanceForCourse,
}) => {
  const courses = useMemo(() => getCourses(), []);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(
    initialCourseId || 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudentsList, setAllStudentsList] = useState<Student[]>(() => getStudents());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Student Form
  const [newDni, setNewDni] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');

  const refreshStudents = () => {
    setAllStudentsList(getStudents());
  };

  const filteredStudents = useMemo(() => {
    return allStudentsList.filter(st => {
      if (selectedCourseFilter !== 'all' && st.courseId !== selectedCourseFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        return studentMatchesQuery(st, searchTerm);
      }
      return true;
    });
  }, [allStudentsList, selectedCourseFilter, searchTerm]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLastName.trim() || !newFirstName.trim() || !newDni.trim()) return;

    const student: Student = {
      id: `st-${Date.now()}`,
      dni: newDni.trim(),
      lastName: newLastName.trim(),
      firstName: newFirstName.trim(),
      courseId: newCourseId,
      guardianName: newGuardianName.trim() || undefined,
      guardianPhone: newGuardianPhone.trim() || undefined,
    };

    saveStudent(student);
    refreshStudents();
    setIsModalOpen(false);

    setNewDni('');
    setNewLastName('');
    setNewFirstName('');
    setNewGuardianName('');
    setNewGuardianPhone('');
  };

  const handleDelete = (student: Student) => {
    if (confirm(`¿Confirma eliminar a ${student.lastName}, ${student.firstName} del padrón?`)) {
      deleteStudent(student.id);
      refreshStudents();
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
              <Users className="w-3.5 h-3.5" />
              <span>Padrón Institucional • I.P.E.T. N° 247</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Nómina de Alumnos y Cursos
            </h1>
            <p className="text-xs text-slate-700 mt-0.5 max-w-2xl">
              Estudiantes matriculados en las divisiones y especialidades técnicas del I.P.E.T. N° 247.
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#143254] hover:bg-[#0e243d] text-white font-bold px-3.5 py-2 rounded-lg shadow text-xs sm:text-sm cursor-pointer flex items-center gap-1.5 border border-[#143254]"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>Añadir Alumno al Padrón</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Course selector */}
          <div className="w-full sm:w-64">
            <select
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 px-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            >
              <option value="all">Todos los Cursos ({allStudentsList.length} alumnos)</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.specialty ? `- ${c.specialty}` : ''} ({c.turn})
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI (sin tildes)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 pl-8 pr-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="text-xs text-slate-700 font-bold self-end md:self-center">
          Alumnos listados: {filteredStudents.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-slate-300 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-900 border-collapse">
            <thead className="bg-[#12263f] text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-2 text-center w-8 border border-[#1c3c63]">N°</th>
                <th className="py-2.5 px-3 border border-[#1c3c63]">Estudiante</th>
                <th className="py-2.5 px-2 text-center font-mono w-28 border border-[#1c3c63]">D.N.I.</th>
                <th className="py-2.5 px-3 border border-[#1c3c63]">Curso / Especialidad</th>
                <th className="py-2.5 px-3 border border-[#1c3c63]">Tutor Responsable</th>
                <th className="py-2.5 px-3 text-right border border-[#1c3c63]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 italic">
                    No se encontraron estudiantes para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const course = courses.find(c => c.id === st.courseId);

                  return (
                    <tr key={st.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {st.lastName}, {st.firstName}
                      </td>

                      <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-700 border-r border-slate-200">
                        {st.dni}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <span className="font-bold text-slate-800">
                          {course ? course.name : 'Sin asignar'}
                        </span>
                        {course?.specialty && (
                          <span className="text-[11px] text-slate-500 block">
                            {course.specialty}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200">
                        {st.guardianName ? (
                          <div>
                            <span className="text-xs font-semibold text-slate-800">
                              {st.guardianName}
                            </span>
                            {st.guardianPhone && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{st.guardianPhone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sin tutor registrado</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onTakeAttendanceForCourse && (
                            <button
                              type="button"
                              onClick={() => onTakeAttendanceForCourse(st.courseId)}
                              className="text-xs text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded cursor-pointer font-bold"
                            >
                              Tomar Asistencia
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(st)}
                            title="Eliminar del padrón"
                            className="text-slate-400 hover:text-rose-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-300 rounded-xl max-w-md w-full p-5 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-900" />
              <span>Añadir Nuevo Estudiante al Padrón</span>
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Gómez"
                    value={newLastName}
                    onChange={e => setNewLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre(s) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcos David"
                    value={newFirstName}
                    onChange={e => setNewFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    D.N.I. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 46.543.210"
                    value={newDni}
                    onChange={e => setNewDni(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Curso *
                  </label>
                  <select
                    value={newCourseId}
                    onChange={e => setNewCourseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.turn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Tutor / Padre / Madre
                </label>
                <input
                  type="text"
                  placeholder="Ej: Rosa Gómez"
                  value={newGuardianName}
                  onChange={e => setNewGuardianName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej: 351-4123456"
                  value={newGuardianPhone}
                  onChange={e => setNewGuardianPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#24693d] hover:bg-[#1c5531] text-white font-bold px-4 py-1.5 rounded text-xs cursor-pointer shadow"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
