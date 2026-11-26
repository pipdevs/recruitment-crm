import type { PayPeriod } from './enums';

// The markets Red Glade works in, offered first. Every other ISO 4217 code
// comes from the browser, so there is no list to maintain.
export const COMMON_CURRENCIES = ['GBP', 'EUR', 'CHF', 'USD', 'CAD'];
export const OTHER_CURRENCIES = Intl.supportedValuesOf('currency').filter(c => !COMMON_CURRENCIES.includes(c));

const PERIOD_LABEL: Record<PayPeriod, string> = { Year: 'year', Day: 'day', Hour: 'hour' };

// "€80,000–95,000 / year", "£550 / day", or null when no pay is set.
export function formatPay(job: {
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  pay_period: string;
}): string | null {
  const { salary_min: min, salary_max: max, salary_currency: currency } = job;
  if (!currency || (min === null && max === null)) return null;
  const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 });
  const plain = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
  const amount =
    min !== null && max !== null && min !== max ? `${money.format(min)}–${plain.format(max)}`
    : money.format((min ?? max)!);
  return `${amount} / ${PERIOD_LABEL[job.pay_period as PayPeriod] ?? job.pay_period.toLowerCase()}`;
}