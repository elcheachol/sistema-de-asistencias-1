/**
 * Normalizes text for search by:
 * - Converting to lowercase
 * - Removing diacritics / accents / tildes (e.g. á -> a, é -> e, í -> i, ó -> o, ú -> u)
 * - Trimming extra whitespace
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Normalizes numbers/DNI for flexible matching without dots, spaces, or hyphens.
 */
export function normalizeDni(dni: string): string {
  if (!dni) return '';
  return dni.replace(/[^0-9]/g, '');
}

/**
 * Flexible student search matcher:
 * - Accent-insensitive (e.g., 'perez' matches 'Pérez', 'diaz' matches 'Díaz')
 * - Case-insensitive (e.g., 'gomez' matches 'GÓMEZ')
 * - Matches first name, last name, or combined full name
 * - Matches DNI with or without formatting dots (e.g., '46128452' matches '46.128.452')
 */
export function studentMatchesQuery(
  student: { lastName: string; firstName: string; dni: string },
  query: string
): boolean {
  if (!query || !query.trim()) return true;

  const cleanQuery = normalizeSearchText(query);
  const cleanDniQuery = normalizeDni(query);

  const cleanLastName = normalizeSearchText(student.lastName);
  const cleanFirstName = normalizeSearchText(student.firstName);
  const cleanFullName = `${cleanLastName} ${cleanFirstName}`;
  const cleanInverseName = `${cleanFirstName} ${cleanLastName}`;
  const cleanDni = normalizeDni(student.dni);

  // Check name match
  const matchesName =
    cleanLastName.includes(cleanQuery) ||
    cleanFirstName.includes(cleanQuery) ||
    cleanFullName.includes(cleanQuery) ||
    cleanInverseName.includes(cleanQuery);

  // Check DNI match
  const matchesDni =
    (cleanDniQuery.length > 0 && cleanDni.includes(cleanDniQuery)) ||
    student.dni.toLowerCase().includes(cleanQuery);

  return matchesName || matchesDni;
}
