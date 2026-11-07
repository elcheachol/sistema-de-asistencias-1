import {
  Course,
  Subject,
  Student,
  UserProfile,
  AttendanceSheet,
  AttendanceStatus,
  StudentMonthlySummary,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  generateSeedAttendance,
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'ipet247_current_user_v1',
  USERS: 'ipet247_users_v1',
  COURSES: 'ipet247_courses_v1',
  SUBJECTS: 'ipet247_subjects_v1',
  STUDENTS: 'ipet247_students_v1',
  ATTENDANCE: 'ipet247_attendance_v1',
};

// Safe JSON loader
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key}`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}`, err);
  }
}

// Ensure initial data exists
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    saveToStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
    saveToStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    saveToStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    saveToStorage(STORAGE_KEYS.ATTENDANCE, generateSeedAttendance());
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default to first preceptor
    saveToStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }
}

// User / Auth
export function getCurrentUser(): UserProfile | null {
  return loadFromStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: UserProfile | null): void {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function getAllUsers(): UserProfile[] {
  return loadFromStorage<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

// Courses
export function getCourses(): Course[] {
  return loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
}

export function saveCourse(course: Course): void {
  const courses = getCourses();
  const index = courses.findIndex(c => c.id === course.id);
  if (index >= 0) {
    courses[index] = course;
  } else {
    courses.push(course);
  }
  saveToStorage(STORAGE_KEYS.COURSES, courses);
}

export function getSubjects(): Subject[] {
  return loadFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
}

export function getSubjectsForCourse(courseId: string): Subject[] {
  const all = getSubjects();
  return all.filter(s => s.courseId === courseId || s.courseId === 'all');
}

// User-specific subject access:
// PRECEPTORES: ONLY take 'sub-general' (Asistencia General de Preceptoría). Cannot take specific subjects.
// PROFESORES: ONLY take their assigned subjects. Cannot take 'sub-general'.
export function getAvailableSubjectsForUser(user: UserProfile, courseId: string): Subject[] {
  const all = getSubjects();
  const courseSubjects = all.filter(s => s.courseId === courseId || s.courseId === 'all');

  if (user.role === 'preceptor') {
    // PRECEPTOR: strictly restricted to General Attendance
    const generalSub = all.find(s => s.id === 'sub-general') || {
      id: 'sub-general',
      name: 'Asistencia General (Preceptoría / Entrada)',
      courseId: 'all',
    };
    return [generalSub];
  }

  // PROFESOR: strictly filter out 'sub-general'
  const curricularSubjects = courseSubjects.filter(s => s.id !== 'sub-general' && s.courseId !== 'all');

  // If teacher has assigned subjects, filter strictly to their subjects
  if (user.assignedSubjects && user.assignedSubjects.length > 0) {
    const teacherSubs = curricularSubjects.filter(
      s => user.assignedSubjects?.includes(s.id) || s.teacherId === user.id
    );
    if (teacherSubs.length > 0) {
      return teacherSubs;
    }
  }

  // Also check if any subject in this course lists this teacher's ID
  const byTeacherId = curricularSubjects.filter(s => s.teacherId === user.id);
  if (byTeacherId.length > 0) {
    return byTeacherId;
  }

  // Fallback for custom teacher without explicit assignments: all curricular subjects of this course (never sub-general!)
  return curricularSubjects;
}

export function getAvailableCoursesForUser(user: UserProfile): Course[] {
  const allCourses = getCourses();
  if (user.role === 'preceptor') {
    return allCourses;
  }

  // For PROFESORES: prioritize courses where they teach subjects
  if (user.assignedSubjects && user.assignedSubjects.length > 0) {
    const allSubs = getSubjects();
    const teacherCourseIds = new Set(
      allSubs
        .filter(s => user.assignedSubjects?.includes(s.id) || s.teacherId === user.id)
        .map(s => s.courseId)
    );

    if (teacherCourseIds.size > 0) {
      return allCourses.filter(c => teacherCourseIds.has(c.id));
    }
  }

  if (user.assignedCourses && user.assignedCourses.length > 0) {
    const userCourses = allCourses.filter(c => user.assignedCourses.includes(c.id));
    if (userCourses.length > 0) return userCourses;
  }

  return allCourses;
}

export function saveSubject(subject: Subject): void {
  const subjects = getSubjects();
  const index = subjects.findIndex(s => s.id === subject.id);
  if (index >= 0) {
    subjects[index] = subject;
  } else {
    subjects.push(subject);
  }
  saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
}

// Students
export function getStudents(): Student[] {
  return loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
}

export function getStudentsByCourse(courseId: string): Student[] {
  const all = getStudents();
  return all
    .filter(s => s.courseId === courseId)
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'es'));
}

export function saveStudent(student: Student): void {
  const students = getStudents();
  const index = students.findIndex(s => s.id === student.id);
  if (index >= 0) {
    students[index] = student;
  } else {
    students.push(student);
  }
  saveToStorage(STORAGE_KEYS.STUDENTS, students);
}

export function deleteStudent(studentId: string): void {
  const students = getStudents().filter(s => s.id !== studentId);
  saveToStorage(STORAGE_KEYS.STUDENTS, students);
}

// Attendance
export function getAllAttendanceSheets(): AttendanceSheet[] {
  return loadFromStorage<AttendanceSheet[]>(STORAGE_KEYS.ATTENDANCE, []);
}

export function saveAttendanceSheet(sheet: AttendanceSheet): void {
  const sheets = getAllAttendanceSheets();
  // Check if a sheet for this date, course and subject already exists to update it
  const existingIdx = sheets.findIndex(
    s => s.date === sheet.date && s.courseId === sheet.courseId && s.subjectId === sheet.subjectId
  );

  if (existingIdx >= 0) {
    sheets[existingIdx] = sheet;
  } else {
    sheets.unshift(sheet);
  }

  saveToStorage(STORAGE_KEYS.ATTENDANCE, sheets);
}

export function deleteAttendanceSheet(sheetId: string): void {
  const sheets = getAllAttendanceSheets().filter(s => s.id !== sheetId);
  saveToStorage(STORAGE_KEYS.ATTENDANCE, sheets);
}

export function findAttendanceSheet(
  date: string,
  courseId: string,
  subjectId: string
): AttendanceSheet | undefined {
  const sheets = getAllAttendanceSheets();
  return sheets.find(
    s => s.date === date && s.courseId === courseId && s.subjectId === subjectId
  );
}

// Monthly calculation helper
export function calculateMonthlyReport(
  courseId: string,
  year: number,
  month: number, // 1 to 12
  subjectId?: string // undefined or 'all' for aggregate
): {
  studentsSummary: StudentMonthlySummary[];
  schoolDaysWithData: number[]; // e.g. [2, 3, 4, 5, 6]
  totalClasses: number;
} {
  const students = getStudentsByCourse(courseId);
  const allSheets = getAllAttendanceSheets();

  // Filter sheets for course and target month/year
  const monthStr = month.toString().padStart(2, '0');
  const yearMonthPrefix = `${year}-${monthStr}`;

  const matchingSheets = allSheets.filter(sheet => {
    if (sheet.courseId !== courseId) return false;
    if (!sheet.date.startsWith(yearMonthPrefix)) return false;
    if (subjectId && subjectId !== 'all') {
      return sheet.subjectId === subjectId;
    }
    return true;
  });

  // Unique days recorded
  const daysRecorded = Array.from(
    new Set(matchingSheets.map(s => parseInt(s.date.split('-')[2], 10)))
  ).sort((a, b) => a - b);

  // Build summary for each student
  const studentsSummary: StudentMonthlySummary[] = students.map(student => {
    let presentes = 0;
    let ausentes = 0;
    let justificados = 0;
    let tardanzas = 0;
    const dailyStatus: Record<number, AttendanceStatus | undefined> = {};

    daysRecorded.forEach(day => {
      const dayDate = `${yearMonthPrefix}-${day.toString().padStart(2, '0')}`;
      // Find sheet for this day
      const daySheets = matchingSheets.filter(s => s.date === dayDate);
      if (daySheets.length === 0) return;

      // In case multiple sheets exist on the same day (e.g., general vs subject), we prioritize general or take the first
      const preferredSheet =
        daySheets.find(s => s.subjectId === (subjectId || 'sub-general')) || daySheets[0];
      const entry = preferredSheet.entries.find(e => e.studentId === student.id);

      if (entry) {
        dailyStatus[day] = entry.status;
        if (entry.status === 'presente') presentes++;
        else if (entry.status === 'ausente') ausentes++;
        else if (entry.status === 'justificado') justificados++;
        else if (entry.status === 'tardanza') tardanzas++;
      }
    });

    // In Argentine schools: 1 ausente = 1 falta, 1 tardanza = 0.5 falta (media falta)
    const totalFaltasComputadas = ausentes + (tardanzas * 0.5);
    const totalEvaluated = presentes + ausentes + justificados + tardanzas;
    const porcentajeAsistencia =
      totalEvaluated > 0
        ? Math.round(((presentes + justificados) / totalEvaluated) * 100)
        : 100;

    let alertaFaltas: 'normal' | 'advertencia' | 'critico' = 'normal';
    // Normativa I.P.E.T. N° 247: a las 25 faltas el estudiante queda en condición de alumno libre
    if (totalFaltasComputadas >= 25) {
      alertaFaltas = 'critico';
    } else if (totalFaltasComputadas >= 18) {
      alertaFaltas = 'advertencia';
    }

    return {
      student,
      presentes,
      ausentes,
      justificados,
      tardanzas,
      totalFaltasComputadas,
      porcentajeAsistencia,
      alertaFaltas,
      dailyStatus,
    };
  });

  return {
    studentsSummary,
    schoolDaysWithData: daysRecorded,
    totalClasses: daysRecorded.length,
  };
}

// Reset data to factory seed
export function resetDataToFactory(): void {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.COURSES);
  localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  initializeStorage();
}
