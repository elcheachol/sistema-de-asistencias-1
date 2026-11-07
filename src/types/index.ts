export type AttendanceStatus = 'presente' | 'ausente' | 'justificado' | 'tardanza';

export type UserRole = 'preceptor' | 'profesor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  turn: 'Mañana' | 'Tarde' | 'Noche' | 'Ambos';
  assignedCourses: string[]; // course IDs
  assignedSubjects?: string[]; // subject IDs (for teachers)
  avatar?: string;
}

export interface Student {
  id: string;
  dni: string;
  lastName: string;
  firstName: string;
  courseId: string;
  guardianName?: string;
  guardianPhone?: string;
  email?: string;
}

export interface Course {
  id: string;
  name: string; // e.g. "4° Año 1° Div."
  specialty?: string; // e.g. "Electromecánica", "Automotores", "Ciclo Básico", "Informática"
  cycle: 'Ciclo Básico' | 'Ciclo Especialidad';
  turn: 'Mañana' | 'Tarde';
  preceptorId?: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "Taller de Mecánica", "Matemática", "Física"
  courseId: string; // ID of the course it belongs to
  teacherId?: string;
  weeklyHours?: number;
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  observation?: string;
}

export interface AttendanceSheet {
  id: string;
  date: string; // YYYY-MM-DD
  courseId: string;
  subjectId: string; // or 'general' for Preceptoria general attendance
  turn: 'Mañana' | 'Tarde';
  takenByUserId: string;
  takenByUserName: string;
  takenByRole: UserRole;
  entries: AttendanceEntry[];
  timestamp: string;
  notes?: string;
}

export interface StudentMonthlySummary {
  student: Student;
  presentes: number;
  ausentes: number;
  justificados: number;
  tardanzas: number;
  totalFaltasComputadas: number; // ausentes + (tardanzas * 0.5)
  porcentajeAsistencia: number;
  alertaFaltas: 'normal' | 'advertencia' | 'critico'; // >=18 advertencia, >=25 libre (I.P.E.T. N° 247)
  dailyStatus: Record<number, AttendanceStatus | undefined>; // day of month (1..31) -> status
}
