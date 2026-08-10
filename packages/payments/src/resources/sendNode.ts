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

/** litd proxies both tapd and LND endpoints, so it's tried first; a bare `lnd` socket only covers base sends. */
export function selectSendNode(
  nodes: readonly SendNodeCandidate[],
  isAsset: boolean,
): SelectedSendNode | null {
  for (const node of nodes) {
    const restHost = node.sockets.litd?.rest ?? (isAsset ? undefined : node.sockets.lnd?.rest);
    if (restHost) {
      return { restHost, encryptedMacaroon: node.encrypted_macaroon, tlsCert: node.tls_cert };
    }
  }
  return null;
}
