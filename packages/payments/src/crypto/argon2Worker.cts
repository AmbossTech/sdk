import { Worker } from 'node:worker_threads';

export interface RunArgon2idOpts {
  dkLen: number;
  t: number;
  m: number;
  p: number;
}

interface HashRequest {
  id: number;
  password: string;
  salt: string;
  opts: RunArgon2idOpts;
}

interface HashResponse {
  id: number;
  hash?: Uint8Array;
  error?: string;
}

const WORKER_SOURCE = `
const { parentPort, workerData } = require('node:worker_threads');
const { argon2id } = require(workerData.argon2Path);
parentPort.on('message', (msg) => {
  try {
    const hash = argon2id(msg.password, msg.salt, msg.opts);
    parentPort.postMessage({ id: msg.id, hash });
  } catch (err) {
    parentPort.postMessage({ id: msg.id, error: err instanceof Error ? err.message : String(err) });
  }
});
`;

let worker: Worker | undefined;
let nextId = 0;
let idleTimer: NodeJS.Timeout | undefined;
const pending = new Map<
  number,
  { resolve: (hash: Uint8Array) => void; reject: (err: Error) => void }
>();

function failAllPending(err: Error): void {
  for (const job of pending.values()) job.reject(err);
  pending.clear();
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = undefined;
  worker = undefined;
}

function scheduleUnref(created: Worker): void {
  if (idleTimer) clearTimeout(idleTimer);
  // Keep the worker briefly referenced so callers that chain KDFs (including
  // Node's test runner) can start their next job before an otherwise-idle
  // process exits. The worker is still released promptly for short-lived CLIs.
  idleTimer = setTimeout(() => {
    idleTimer = undefined;
    if (pending.size === 0) created.unref();
  }, 1_000);
}

function getWorker(): Worker {
  if (worker) return worker;

  const argon2Path = require.resolve('@noble/hashes/argon2');
  const created = new Worker(WORKER_SOURCE, { eval: true, workerData: { argon2Path } });

  created.on('message', (res: HashResponse) => {
    const job = pending.get(res.id);
    if (!job) return;
    pending.delete(res.id);
    if (res.error) job.reject(new Error(res.error));
    else job.resolve(res.hash as Uint8Array);
    if (pending.size === 0) scheduleUnref(created);
  });
  created.on('error', failAllPending);
  created.on('exit', () => failAllPending(new Error('Argon2 worker exited unexpectedly')));

  worker = created;
  return created;
}

/** Runs Argon2id on a shared background worker so it never blocks Node's event loop. */
export function runArgon2id(
  password: string,
  salt: string,
  opts: RunArgon2idOpts,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = undefined;
    const id = nextId++;
    pending.set(id, { resolve, reject });
    w.ref();
    const request: HashRequest = { id, password, salt, opts };
    w.postMessage(request);
  });
}
