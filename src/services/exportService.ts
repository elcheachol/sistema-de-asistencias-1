import * as XLSX from 'xlsx';
import { Course, Subject, StudentMonthlySummary } from '../types';

interface ExportReportOptions {
  course: Course;
  subject?: Subject;
  monthName: string;
  year: number;
  daysWithData: number[];
  summaries: StudentMonthlySummary[];
  institutionName?: string;
}

export function exportMonthlyReportToExcel(options: ExportReportOptions): void {
  const {
    course,
    subject,
    monthName,
    year,
    daysWithData,
    summaries,
    institutionName = 'I.P.E.T. N° 247 - Escuela Técnica',
  } = options;

  // Header rows
  const headerRows: (string | number)[][] = [
    [institutionName.toUpperCase()],
    [`PLANILLA MENSUAL DE CONTROL DE ASISTENCIAS - ${monthName.toUpperCase()} ${year}`],
    [
      `Curso: ${course.name}`,
      `Especialidad: ${course.specialty || 'General'}`,
      `Turno: ${course.turn}`,
      `Materia: ${subject ? subject.name : 'Asistencia General (Preceptoría)'}`,
    ],
    [], // empty line
  ];

  // Table header row: #, DNI, Apellido y Nombre, [Day 1, Day 2...], Pres., Aus., Just., Tard., Total Faltas, % Asistencia
  const tableHeaders: string[] = ['N°', 'D.N.I.', 'Apellido y Nombre'];
  daysWithData.forEach(day => {
    tableHeaders.push(`Día ${day}`);
  });
  tableHeaders.push(
    'Total Presentes',
    'Total Inasistencias',
    'Justificadas',
    'Tardanzas',
    'Faltas Computadas',
    '% Asist.'
  );

  const dataRows: (string | number)[][] = summaries.map((item, index) => {
    const row: (string | number)[] = [
      index + 1,
      item.student.dni,
      `${item.student.lastName}, ${item.student.firstName}`,
    ];

    // Day values
    daysWithData.forEach(day => {
      const st = item.dailyStatus[day];
      if (st === 'presente') row.push('P');
      else if (st === 'ausente') row.push('A');
      else if (st === 'justificado') row.push('J');
      else if (st === 'tardanza') row.push('T');
      else row.push('-');
    });

    row.push(
      item.presentes,
      item.ausentes,
      item.justificados,
      item.tardanzas,
      item.totalFaltasComputadas,
      `${item.porcentajeAsistencia}%`
    );

    return row;
  });

  // Calculate totals/averages row
  const totalStudents = summaries.length;
  const avgAttendance =
    totalStudents > 0
      ? Math.round(
          summaries.reduce((acc, curr) => acc + curr.porcentajeAsistencia, 0) / totalStudents
        )
      : 0;

  const totalPres = summaries.reduce((acc, curr) => acc + curr.presentes, 0);
  const totalAus = summaries.reduce((acc, curr) => acc + curr.ausentes, 0);
  const totalJust = summaries.reduce((acc, curr) => acc + curr.justificados, 0);
  const totalTard = summaries.reduce((acc, curr) => acc + curr.tardanzas, 0);
  const totalFaltas = summaries.reduce((acc, curr) => acc + curr.totalFaltasComputadas, 0);

  const summaryRow: (string | number)[] = ['TOTALES', '', ''];
  daysWithData.forEach(() => summaryRow.push(''));
  summaryRow.push(totalPres, totalAus, totalJust, totalTard, totalFaltas, `${avgAttendance}% Prom.`);

  const allRows = [...headerRows, tableHeaders, ...dataRows, [], summaryRow];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths
  const colWidths = [
    { wch: 5 }, // N°
    { wch: 14 }, // DNI
    { wch: 30 }, // Apellido y Nombre
  ];
  daysWithData.forEach(() => colWidths.push({ wch: 7 }));
  colWidths.push(
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 }
  );
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Asistencias_${monthName}`);

  // Clean filename
  const cleanCourse = course.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `IPET247_Asistencias_${cleanCourse}_${monthName}_${year}.xlsx`;

  XLSX.writeFile(wb, filename);
}

export function exportMonthlyReportToCSV(options: ExportReportOptions): void {
  const { course, subject, monthName, year, daysWithData, summaries } = options;

  const csvRows: string[] = [];

  // Metadata
  csvRows.push(`"I.P.E.T. N° 247 - PLANILLA MENSUAL DE ASISTENCIAS"`);
  csvRows.push(`"Periodo: ${monthName} ${year} - Curso: ${course.name} - Turno: ${course.turn}"`);
  csvRows.push(`"Materia: ${subject ? subject.name : 'Asistencia General (Preceptoría)'}"`);
  csvRows.push('');

  // Headers
  const headers = ['Nro', 'DNI', 'Alumno'];
  daysWithData.forEach(d => headers.push(`Dia_${d}`));
  headers.push('Presentes', 'Ausentes', 'Justificados', 'Tardanzas', 'Faltas_Computadas', 'Porcentaje');
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Rows
  summaries.forEach((s, idx) => {
    const row = [
      (idx + 1).toString(),
      `"${s.student.dni}"`,
      `"${s.student.lastName}, ${s.student.firstName}"`,
    ];

    daysWithData.forEach(day => {
      const code = s.dailyStatus[day] || '-';
      row.push(`"${code.toUpperCase().slice(0, 1)}"`);
    });

    row.push(
      s.presentes.toString(),
      s.ausentes.toString(),
      s.justificados.toString(),
      s.tardanzas.toString(),
      s.totalFaltasComputadas.toString(),
      `"${s.porcentajeAsistencia}%"`
    );

    csvRows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n'); // UTF-8 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const cleanCourse = course.name.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `IPET247_Asistencias_${cleanCourse}_${monthName}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
