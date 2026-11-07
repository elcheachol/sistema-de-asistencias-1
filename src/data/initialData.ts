import { Course, Subject, Student, UserProfile, AttendanceSheet } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-prec-1',
    name: 'Lucas Benítez',
    email: 'lbenitez@ipet247.edu.ar',
    role: 'preceptor',
    turn: 'Mañana',
    assignedCourses: ['c-1a', 'c-2a', 'c-3a', 'c-4em', 'c-5em'],
  },
  {
    id: 'user-prec-2',
    name: 'Valeria Gómez',
    email: 'vgomez@ipet247.edu.ar',
    role: 'preceptor',
    turn: 'Tarde',
    assignedCourses: ['c-1b', 'c-2b', 'c-4au', 'c-6inf'],
  },
  {
    id: 'user-prof-1',
    name: 'Ing. Marcelo Rossi',
    email: 'mrossi@ipet247.edu.ar',
    role: 'profesor',
    turn: 'Mañana',
    assignedCourses: ['c-4em', 'c-5em'],
    assignedSubjects: ['sub-tall-4em', 'sub-maq-5em'],
  },
  {
    id: 'user-prof-2',
    name: 'Lic. Silvina Morales',
    email: 'smorales@ipet247.edu.ar',
    role: 'profesor',
    turn: 'Ambos',
    assignedCourses: ['c-1a', 'c-2a', 'c-4em'],
    assignedSubjects: ['sub-mat-1a', 'sub-mat-2a', 'sub-mat-4em'],
  },
  {
    id: 'user-prof-3',
    name: 'Prof. Gabriel Heredia',
    email: 'gheredia@ipet247.edu.ar',
    role: 'profesor',
    turn: 'Tarde',
    assignedCourses: ['c-4au', 'c-6inf'],
    assignedSubjects: ['sub-mot-4au', 'sub-prog-6inf'],
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c-1a',
    name: '1° Año "A"',
    specialty: 'Ciclo Básico Técnico',
    cycle: 'Ciclo Básico',
    turn: 'Mañana',
    preceptorId: 'user-prec-1',
  },
  {
    id: 'c-1b',
    name: '1° Año "B"',
    specialty: 'Ciclo Básico Técnico',
    cycle: 'Ciclo Básico',
    turn: 'Tarde',
    preceptorId: 'user-prec-2',
  },
  {
    id: 'c-2a',
    name: '2° Año "A"',
    specialty: 'Ciclo Básico Técnico',
    cycle: 'Ciclo Básico',
    turn: 'Mañana',
    preceptorId: 'user-prec-1',
  },
  {
    id: 'c-3a',
    name: '3° Año "A"',
    specialty: 'Ciclo Básico Técnico',
    cycle: 'Ciclo Básico',
    turn: 'Mañana',
    preceptorId: 'user-prec-1',
  },
  {
    id: 'c-4em',
    name: '4° Año "1°"',
    specialty: 'Electromecánica',
    cycle: 'Ciclo Especialidad',
    turn: 'Mañana',
    preceptorId: 'user-prec-1',
  },
  {
    id: 'c-4au',
    name: '4° Año "2°"',
    specialty: 'Automotores',
    cycle: 'Ciclo Especialidad',
    turn: 'Tarde',
    preceptorId: 'user-prec-2',
  },
  {
    id: 'c-5em',
    name: '5° Año "1°"',
    specialty: 'Electromecánica',
    cycle: 'Ciclo Especialidad',
    turn: 'Mañana',
    preceptorId: 'user-prec-1',
  },
  {
    id: 'c-6inf',
    name: '6° Año "1°"',
    specialty: 'Informática Profesional',
    cycle: 'Ciclo Especialidad',
    turn: 'Tarde',
    preceptorId: 'user-prec-2',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // General preceptoria option (always present)
  { id: 'sub-general', name: 'Asistencia General (Preceptoría / Entrada)', courseId: 'all' },

  // 1° A
  { id: 'sub-mat-1a', name: 'Matemática I', courseId: 'c-1a', teacherId: 'user-prof-2', weeklyHours: 5 },
  { id: 'sub-len-1a', name: 'Lengua y Literatura I', courseId: 'c-1a', weeklyHours: 4 },
  { id: 'sub-tall-1a', name: 'Taller de Ajuste Manual y Hojalatería', courseId: 'c-1a', weeklyHours: 6 },
  { id: 'sub-dib-1a', name: 'Dibujo Técnico Básico', courseId: 'c-1a', weeklyHours: 4 },

  // 1° B
  { id: 'sub-mat-1b', name: 'Matemática I', courseId: 'c-1b', weeklyHours: 5 },
  { id: 'sub-tall-1b', name: 'Taller de Ajuste Manual', courseId: 'c-1b', weeklyHours: 6 },
  { id: 'sub-cs-1b', name: 'Ciencias Naturales (Físico-Química)', courseId: 'c-1b', weeklyHours: 4 },

  // 2° A
  { id: 'sub-mat-2a', name: 'Matemática II', courseId: 'c-2a', teacherId: 'user-prof-2', weeklyHours: 5 },
  { id: 'sub-tall-2a', name: 'Taller de Tornería y Soldadura', courseId: 'c-2a', weeklyHours: 6 },
  { id: 'sub-elec-2a', name: 'Electricidad Básica', courseId: 'c-2a', weeklyHours: 4 },

  // 3° A
  { id: 'sub-mat-3a', name: 'Matemática III', courseId: 'c-3a', weeklyHours: 4 },
  { id: 'sub-tall-3a', name: 'Taller de Mecanizado CNC y Fresado', courseId: 'c-3a', weeklyHours: 6 },
  { id: 'sub-fis-3a', name: 'Física Aplicada', courseId: 'c-3a', weeklyHours: 4 },

  // 4° Electromecánica
  { id: 'sub-tall-4em', name: 'Taller de Máquinas Eléctricas y Ensayos', courseId: 'c-4em', teacherId: 'user-prof-1', weeklyHours: 8 },
  { id: 'sub-mat-4em', name: 'Matemática Aplicada IV', courseId: 'c-4em', teacherId: 'user-prof-2', weeklyHours: 4 },
  { id: 'sub-termo-4em', name: 'Termodinámica y Máquinas Térmicas', courseId: 'c-4em', weeklyHours: 4 },
  { id: 'sub-est-4em', name: 'Estática y Resistencia de Materiales', courseId: 'c-4em', weeklyHours: 4 },

  // 4° Automotores
  { id: 'sub-mot-4au', name: 'Motores de Combustión Interna I', courseId: 'c-4au', teacherId: 'user-prof-3', weeklyHours: 8 },
  { id: 'sub-elec-4au', name: 'Sistemas Eléctricos del Automotor', courseId: 'c-4au', weeklyHours: 6 },
  { id: 'sub-aut-4au', name: 'Chasis y Transmisión', courseId: 'c-4au', weeklyHours: 4 },

  // 5° Electromecánica
  { id: 'sub-maq-5em', name: 'Instalaciones Eléctricas Industriales', courseId: 'c-5em', teacherId: 'user-prof-1', weeklyHours: 8 },
  { id: 'sub-aut-5em', name: 'Automatización y Control (PLC)', courseId: 'c-5em', weeklyHours: 6 },
  { id: 'sub-seg-5em', name: 'Seguridad e Higiene Laboral', courseId: 'c-5em', weeklyHours: 3 },

  // 6° Informática
  { id: 'sub-prog-6inf', name: 'Programación y Desarrollo Web', courseId: 'c-6inf', teacherId: 'user-prof-3', weeklyHours: 8 },
  { id: 'sub-red-6inf', name: 'Redes y Telecomunicaciones', courseId: 'c-6inf', weeklyHours: 6 },
  { id: 'sub-bd-6inf', name: 'Bases de Datos Relacionales', courseId: 'c-6inf', weeklyHours: 4 },
];

export const INITIAL_STUDENTS: Student[] = [
  // 4° Año 1° Electromecánica (Full realistic group)
  { id: 'st-4em-01', dni: '46.128.452', lastName: 'Acosta', firstName: 'Joaquín Ignacio', courseId: 'c-4em', guardianName: 'Silvia Acosta', guardianPhone: '351-4829102' },
  { id: 'st-4em-02', dni: '45.981.203', lastName: 'Balderrama', firstName: 'Mateo Lautaro', courseId: 'c-4em', guardianName: 'Carlos Balderrama', guardianPhone: '351-5192831' },
  { id: 'st-4em-03', dni: '46.340.119', lastName: 'Caballero', firstName: 'Sofía Belén', courseId: 'c-4em', guardianName: 'Marta Caballero', guardianPhone: '351-6781290' },
  { id: 'st-4em-04', dni: '45.892.304', lastName: 'Carrizo', firstName: 'Facundo Agustín', courseId: 'c-4em', guardianName: 'Jorge Carrizo', guardianPhone: '351-3490182' },
  { id: 'st-4em-05', dni: '46.502.941', lastName: 'Delgado', firstName: 'Lucas Ezequiel', courseId: 'c-4em', guardianName: 'Elena Delgado', guardianPhone: '351-7890123' },
  { id: 'st-4em-06', dni: '45.772.109', lastName: 'Espíndola', firstName: 'Valentina Rocío', courseId: 'c-4em', guardianName: 'Ricardo Espíndola', guardianPhone: '351-8901234' },
  { id: 'st-4em-07', dni: '46.019.283', lastName: 'Ferreyra', firstName: 'Santiago Tomás', courseId: 'c-4em', guardianName: 'Marcela Ferreyra', guardianPhone: '351-9012345' },
  { id: 'st-4em-08', dni: '46.211.890', lastName: 'Giménez', firstName: 'Thiago Damián', courseId: 'c-4em', guardianName: 'Gustavo Giménez', guardianPhone: '351-0123456' },
  { id: 'st-4em-09', dni: '45.912.448', lastName: 'Herrera', firstName: 'Martina Sol', courseId: 'c-4em', guardianName: 'Patricia Herrera', guardianPhone: '351-1234567' },
  { id: 'st-4em-10', dni: '46.401.782', lastName: 'Juárez', firstName: 'Franco Nicolás', courseId: 'c-4em', guardianName: 'Roberto Juárez', guardianPhone: '351-2345678' },
  { id: 'st-4em-11', dni: '45.698.120', lastName: 'López', firstName: 'Nahuel Alejandro', courseId: 'c-4em', guardianName: 'Beatriz López', guardianPhone: '351-3456789' },
  { id: 'st-4em-12', dni: '46.155.932', lastName: 'Molina', firstName: 'Camila Ayelén', courseId: 'c-4em', guardianName: 'Esteban Molina', guardianPhone: '351-4567890' },
  { id: 'st-4em-13', dni: '45.820.311', lastName: 'Navarro', firstName: 'Enzo Gabriel', courseId: 'c-4em', guardianName: 'Lorena Navarro', guardianPhone: '351-5678901' },
  { id: 'st-4em-14', dni: '46.290.418', lastName: 'Peralta', firstName: 'Maximiliano', courseId: 'c-4em', guardianName: 'Hugo Peralta', guardianPhone: '351-6789012' },
  { id: 'st-4em-15', dni: '46.002.399', lastName: 'Quinteros', firstName: 'Luciana Abril', courseId: 'c-4em', guardianName: 'Claudia Quinteros', guardianPhone: '351-7890124' },
  { id: 'st-4em-16', dni: '45.901.277', lastName: 'Ríos', firstName: 'Bautista Benjamín', courseId: 'c-4em', guardianName: 'Daniel Ríos', guardianPhone: '351-8901235' },
  { id: 'st-4em-17', dni: '46.442.810', lastName: 'Soria', firstName: 'Tomás Julián', courseId: 'c-4em', guardianName: 'Roxana Soria', guardianPhone: '351-9012346' },
  { id: 'st-4em-18', dni: '45.789.012', lastName: 'Toledo', firstName: 'Milagros Agostina', courseId: 'c-4em', guardianName: 'Marcos Toledo', guardianPhone: '351-0123457' },

  // 1° Año A
  { id: 'st-1a-01', dni: '48.112.330', lastName: 'Álvarez', firstName: 'Bruno Matías', courseId: 'c-1a', guardianName: 'Cecilia Álvarez', guardianPhone: '351-2233441' },
  { id: 'st-1a-02', dni: '48.234.901', lastName: 'Benítez', firstName: 'Ciro Valentín', courseId: 'c-1a', guardianName: 'Juan Benítez', guardianPhone: '351-3344552' },
  { id: 'st-1a-03', dni: '48.098.221', lastName: 'Castro', firstName: 'Delfina Rocío', courseId: 'c-1a', guardianName: 'Mariana Castro', guardianPhone: '351-4455663' },
  { id: 'st-1a-04', dni: '48.455.109', lastName: 'Díaz', firstName: 'Emiliano José', courseId: 'c-1a', guardianName: 'Federico Díaz', guardianPhone: '351-5566774' },
  { id: 'st-1a-05', dni: '48.309.812', lastName: 'Fernández', firstName: 'Guadalupe Luz', courseId: 'c-1a', guardianName: 'Norma Fernández', guardianPhone: '351-6677885' },
  { id: 'st-1a-06', dni: '48.190.234', lastName: 'González', firstName: 'Ignacio David', courseId: 'c-1a', guardianName: 'Pablo González', guardianPhone: '351-7788996' },
  { id: 'st-1a-07', dni: '48.601.442', lastName: 'Luna', firstName: 'Jazmín Anahí', courseId: 'c-1a', guardianName: 'Laura Luna', guardianPhone: '351-8899007' },
  { id: 'st-1a-08', dni: '48.512.909', lastName: 'Mansilla', firstName: 'Leonel Andrés', courseId: 'c-1a', guardianName: 'Andrés Mansilla', guardianPhone: '351-9900118' },
  { id: 'st-1a-09', dni: '48.421.770', lastName: 'Romero', firstName: 'Valeria Nicole', courseId: 'c-1a', guardianName: 'Sonia Romero', guardianPhone: '351-1122339' },
  { id: 'st-1a-10', dni: '48.330.129', lastName: 'Vázquez', firstName: 'Zoe Mailén', courseId: 'c-1a', guardianName: 'Cristian Vázquez', guardianPhone: '351-2233440' },

  // 4° Automotores
  { id: 'st-4au-01', dni: '46.102.304', lastName: 'Aguirre', firstName: 'Brian Alexis', courseId: 'c-4au', guardianName: 'Raúl Aguirre', guardianPhone: '351-9876543' },
  { id: 'st-4au-02', dni: '46.220.912', lastName: 'Correa', firstName: 'Damian Leonel', courseId: 'c-4au', guardianName: 'Rosa Correa', guardianPhone: '351-8765432' },
  { id: 'st-4au-03', dni: '46.098.771', lastName: 'Flores', firstName: 'Gastón Ariel', courseId: 'c-4au', guardianName: 'Héctor Flores', guardianPhone: '351-7654321' },
  { id: 'st-4au-04', dni: '46.331.409', lastName: 'Godoy', firstName: 'Lautaro Iván', courseId: 'c-4au', guardianName: 'Teresa Godoy', guardianPhone: '351-6543210' },
  { id: 'st-4au-05', dni: '45.989.123', lastName: 'Lucero', firstName: 'Matías Ezequiel', courseId: 'c-4au', guardianName: 'Oscar Lucero', guardianPhone: '351-5432109' },
  { id: 'st-4au-06', dni: '46.411.002', lastName: 'Medina', firstName: 'Ramiro Benjamín', courseId: 'c-4au', guardianName: 'Susana Medina', guardianPhone: '351-4321098' },
  { id: 'st-4au-07', dni: '46.190.844', lastName: 'Paz', firstName: 'Santino Joel', courseId: 'c-4au', guardianName: 'Walter Paz', guardianPhone: '351-3210987' },
  { id: 'st-4au-08', dni: '45.877.291', lastName: 'Suárez', firstName: 'Tobías Valentín', courseId: 'c-4au', guardianName: 'Graciela Suárez', guardianPhone: '351-2109876' },

  // 6° Informática
  { id: 'st-6inf-01', dni: '44.890.112', lastName: 'Barreto', firstName: 'Alejo Martín', courseId: 'c-6inf', guardianName: 'Mirta Barreto', guardianPhone: '351-1209384' },
  { id: 'st-6inf-02', dni: '44.712.940', lastName: 'Bustos', firstName: 'Camila Victoria', courseId: 'c-6inf', guardianName: 'Jorge Bustos', guardianPhone: '351-2310495' },
  { id: 'st-6inf-03', dni: '44.920.334', lastName: 'Chávez', firstName: 'Felipe Agustín', courseId: 'c-6inf', guardianName: 'Liliana Chávez', guardianPhone: '351-3421506' },
  { id: 'st-6inf-04', dni: '44.601.889', lastName: 'Domínguez', firstName: 'Joaquín Ignacio', courseId: 'c-6inf', guardianName: 'Eduardo Domínguez', guardianPhone: '351-4532617' },
  { id: 'st-6inf-05', dni: '44.882.102', lastName: 'Ibáñez', firstName: 'Lucía Milagros', courseId: 'c-6inf', guardianName: 'Mónica Ibáñez', guardianPhone: '351-5643728' },
  { id: 'st-6inf-06', dni: '44.790.415', lastName: 'Montenegro', firstName: 'Manuel Tobías', courseId: 'c-6inf', guardianName: 'Carlos Montenegro', guardianPhone: '351-6754839' },
  { id: 'st-6inf-07', dni: '44.943.201', lastName: 'Ojeda', firstName: 'Victoria Sol', courseId: 'c-6inf', guardianName: 'Daniela Ojeda', guardianPhone: '351-7865940' },
  { id: 'st-6inf-08', dni: '44.699.810', lastName: 'Vega', firstName: 'Ulises Damián', courseId: 'c-6inf', guardianName: 'Héctor Vega', guardianPhone: '351-8976051' },
];

// Helper to generate seed attendance sheets for current month (November 2026) and previous days
export function generateSeedAttendance(): AttendanceSheet[] {
  const sheets: AttendanceSheet[] = [];
  const students4em = INITIAL_STUDENTS.filter(s => s.courseId === 'c-4em');
  const students1a = INITIAL_STUDENTS.filter(s => s.courseId === 'c-1a');

  // Days in November 2026 (Mon-Fri school days up to Nov 6)
  // Nov 1 = Sun, Nov 2 = Mon, Nov 3 = Tue, Nov 4 = Wed, Nov 5 = Thu, Nov 6 = Fri
  const schoolDaysNov = [
    '2026-11-02',
    '2026-11-03',
    '2026-11-04',
    '2026-11-05',
    '2026-11-06',
  ];

  // Also seed some October 2026 days for full month reporting check
  const schoolDaysOct = [
    '2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06', '2026-10-07',
    '2026-10-08', '2026-10-09', '2026-10-13', '2026-10-14', '2026-10-15',
    '2026-10-16', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22',
    '2026-10-23', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'
  ];

  // Populate 4° EM for November
  schoolDaysNov.forEach((date, index) => {
    // Preceptoria general attendance
    const entriesGeneral = students4em.map((st, i) => {
      // Create some realistic patterns
      if (i === 1 && (index === 0 || index === 2)) {
        return { studentId: st.id, status: 'tardanza' as const, observation: 'Llegó 7:45 hs' };
      }
      if (i === 4 && index === 1) {
        return { studentId: st.id, status: 'justificado' as const, observation: 'Certificado odontológico' };
      }
      if (i === 10 && (index === 2 || index === 3)) {
        return { studentId: st.id, status: 'ausente' as const, observation: 'Sin aviso de los padres' };
      }
      if (i === 13 && index === 4) {
        return { studentId: st.id, status: 'ausente' as const, observation: '' };
      }
      return { studentId: st.id, status: 'presente' as const };
    });

    sheets.push({
      id: `sheet-seed-4em-gen-${date}`,
      date,
      courseId: 'c-4em',
      subjectId: 'sub-general',
      turn: 'Mañana',
      takenByUserId: 'user-prec-1',
      takenByUserName: 'Lucas Benítez',
      takenByRole: 'preceptor',
      entries: entriesGeneral,
      timestamp: `${date}T07:40:00Z`,
      notes: 'Registro diario de entrada regular.',
    });

    // Subject attendance for Taller de Máquinas Eléctricas
    if (index === 1 || index === 3) {
      const entriesTaller = students4em.map((st, i) => {
        if (i === 10) return { studentId: st.id, status: 'ausente' as const, observation: 'Ausente en jornada de taller' };
        if (i === 7 && index === 3) return { studentId: st.id, status: 'tardanza' as const, observation: 'Ingreso tardío al pañol' };
        return { studentId: st.id, status: 'presente' as const };
      });

      sheets.push({
        id: `sheet-seed-4em-tall-${date}`,
        date,
        courseId: 'c-4em',
        subjectId: 'sub-tall-4em',
        turn: 'Mañana',
        takenByUserId: 'user-prof-1',
        takenByUserName: 'Ing. Marcelo Rossi',
        takenByRole: 'profesor',
        entries: entriesTaller,
        timestamp: `${date}T09:15:00Z`,
        notes: 'Prácticas de conexionado en banco de prueba.',
      });
    }
  });

  // Seed October 2026 for 4° EM so that monthly report for October is complete
  schoolDaysOct.forEach((date, idx) => {
    const entriesGeneral = students4em.map((st, i) => {
      // Peralta (i=13) has several absences to demonstrate alert thresholds
      if (i === 13 && (idx % 3 === 0)) {
        return { studentId: st.id, status: 'ausente' as const, observation: 'Falta injustificada' };
      }
      if (i === 4 && (idx === 4 || idx === 8)) {
        return { studentId: st.id, status: 'justificado' as const, observation: 'Licencia médica' };
      }
      if (i === 1 && (idx % 4 === 0)) {
        return { studentId: st.id, status: 'tardanza' as const, observation: 'Demora transporte' };
      }
      if ((i + idx) % 17 === 0) {
        return { studentId: st.id, status: 'ausente' as const };
      }
      return { studentId: st.id, status: 'presente' as const };
    });

    sheets.push({
      id: `sheet-seed-oct-${date}`,
      date,
      courseId: 'c-4em',
      subjectId: 'sub-general',
      turn: 'Mañana',
      takenByUserId: 'user-prec-1',
      takenByUserName: 'Lucas Benítez',
      takenByRole: 'preceptor',
      entries: entriesGeneral,
      timestamp: `${date}T07:45:00Z`,
      notes: 'Control matutino preceptoría.',
    });
  });

  // Also seed 1° A for today
  const entries1a = students1a.map((st, i) => {
    if (i === 3) return { studentId: st.id, status: 'ausente' as const, observation: 'Aviso por WhatsApp' };
    if (i === 7) return { studentId: st.id, status: 'tardanza' as const, observation: 'Tardanza 10 min' };
    return { studentId: st.id, status: 'presente' as const };
  });

  sheets.push({
    id: `sheet-seed-1a-today`,
    date: '2026-11-06',
    courseId: 'c-1a',
    subjectId: 'sub-general',
    turn: 'Mañana',
    takenByUserId: 'user-prec-1',
    takenByUserName: 'Lucas Benítez',
    takenByRole: 'preceptor',
    entries: entries1a,
    timestamp: '2026-11-06T07:35:00Z',
    notes: 'Primer año A - Entrada completa.',
  });

  return sheets;
}
