/** Minimal shape of a node permission entry needed to route a send. */
export interface SendNodeCandidate {
  encrypted_macaroon: string;
  tls_cert?: string | null;
  sockets: {
    lnd?: { rest: string } | null;
    litd?: { rest: string } | null;
  };
}

export interface SelectedSendNode {
  restHost: string;
  encryptedMacaroon: string;
  tlsCert?: string | null;
}

/**
 * Picks the first node exposing a usable REST endpoint for the send: litd for
 * Taproot Asset wallets, LND otherwise. Ported from amboss-rails `pickSendNode`.
 */
export function selectSendNode(
  nodes: readonly SendNodeCandidate[],
  isAsset: boolean,
): SelectedSendNode | null {
  for (const node of nodes) {
    const restHost = isAsset ? node.sockets.litd?.rest : node.sockets.lnd?.rest;
    if (restHost) {
      return { restHost, encryptedMacaroon: node.encrypted_macaroon, tlsCert: node.tls_cert };
    }
  }
  return null;
}
