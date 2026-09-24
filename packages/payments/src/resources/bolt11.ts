/**
 * Whether a BOLT11 invoice leaves the amount to the payer. The amount lives in
 * the human-readable part (everything before the last `1`) after the `ln` +
 * network prefix, and no network prefix contains a digit.
 */
export function isAmountlessBolt11(paymentRequest: string): boolean {
  const invoice = paymentRequest.toLowerCase().replace(/^lightning:/, '');
  const humanReadablePart = invoice.slice(0, invoice.lastIndexOf('1'));
  return !/\d/.test(humanReadablePart);
}
