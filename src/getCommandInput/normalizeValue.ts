export function normalizeValue(value: string): string | number | boolean {
  if(!value || value === 'true') return true;
  if (value === 'false') return false;

  const number = parseFloat(value);
  if (!isNaN(number)) return number;

  return value.replace(/['"]/g, '');
}
