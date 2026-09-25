import { decode } from 'light-bolt11-decoder';

/** Throws when `paymentRequest` is not a valid BOLT11 invoice. */
export function isAmountlessBolt11(paymentRequest: string): boolean {
  const invoice = paymentRequest.replace(/^lightning:/i, '');
  return !decode(invoice).sections.some((section) => section.name === 'amount');
}
