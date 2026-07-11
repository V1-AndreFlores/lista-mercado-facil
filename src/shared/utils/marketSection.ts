export function sanitizeAisleNumberInput(rawValue: string | number | undefined | null): string {
  const digits = String(rawValue ?? '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  const parsedValue = Number.parseInt(digits, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return '';
  }

  return String(parsedValue);
}

export function formatAisleNumber(value: string | number | undefined | null): string {
  const sanitizedValue = sanitizeAisleNumberInput(value);
  return sanitizedValue ? sanitizedValue.padStart(2, '0') : '--';
}
