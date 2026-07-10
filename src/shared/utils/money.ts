const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function sanitizeCurrencyDigits(rawValue: string): string {
  return rawValue.replace(/\D/g, '');
}

export function parseCurrencyInputToCents(rawValue: string): number | undefined {
  const digits = sanitizeCurrencyDigits(rawValue);

  if (!digits) {
    return undefined;
  }

  const cents = Number.parseInt(digits, 10);

  if (!Number.isFinite(cents) || cents <= 0) {
    return undefined;
  }

  return cents;
}

export function formatCurrencyCents(valueInCents: number | undefined | null): string {
  if (typeof valueInCents !== 'number' || !Number.isFinite(valueInCents) || valueInCents <= 0) {
    return '';
  }

  return currencyFormatter.format(valueInCents / 100);
}

export function maskCurrencyInput(rawValue: string): string {
  const cents = parseCurrencyInputToCents(rawValue);
  return cents ? formatCurrencyCents(cents) : '';
}

export function multiplyCurrencyCents(unitPriceCents: number | undefined, quantity: number): number {
  if (
    typeof unitPriceCents !== 'number'
    || !Number.isFinite(unitPriceCents)
    || unitPriceCents <= 0
  ) {
    return 0;
  }

  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.trunc(quantity) : 1;
  return unitPriceCents * safeQuantity;
}
