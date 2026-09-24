/** The amount sits in the human-readable part (before the last `1`); network prefixes have no digits. */
export function isAmountlessBolt11(paymentRequest: string): boolean {
  const invoice = paymentRequest.toLowerCase().replace(/^lightning:/, '');
  const humanReadablePart = invoice.slice(0, invoice.lastIndexOf('1'));
  return !/\d/.test(humanReadablePart);
}
