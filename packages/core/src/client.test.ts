import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AmbossClient } from './client.js';
import { ConfigError } from './errors.js';

describe('AmbossClient', () => {
  it('defaults baseUrl to production endpoint', () => {
    const config = AmbossClient.resolveConfig({});
    assert.equal(config.baseUrl, 'https://rails.amboss.tech/graphql');
  });

  it('respects baseUrl override', () => {
    const config = AmbossClient.resolveConfig({ baseUrl: 'https://example.test/graphql' });
    assert.equal(config.baseUrl, 'https://example.test/graphql');
  });

  it('exposes undefined apiKey when not provided', () => {
    const config = AmbossClient.resolveConfig({});
    assert.equal(config.apiKey, undefined);
  });

  it('uses provided fetch implementation', () => {
    const custom: typeof fetch = async () => new Response('{}');
    const config = AmbossClient.resolveConfig({ fetch: custom });
    assert.equal(config.fetch, custom);
  });

  it('throws ConfigError when requireApiKey called without apiKey', () => {
    class Probe extends AmbossClient {
      check(): string {
        return this.requireApiKey('test op');
      }
    }
    const probe = new Probe({});
    assert.throws(
      () => probe.check(),
      (err: unknown) => err instanceof ConfigError,
    );
  });

  it('returns apiKey from requireApiKey when configured', () => {
    class Probe extends AmbossClient {
      check(): string {
        return this.requireApiKey('test op');
      }
    }
    const probe = new Probe({ apiKey: 'sk_test' });
    assert.equal(probe.check(), 'sk_test');
  });

  it('exposes undefined serviceApiKey when not provided', () => {
    const config = AmbossClient.resolveConfig({});
    assert.equal(config.serviceApiKey, undefined);
  });

  it('requireServiceApiKey throws without a serviceApiKey but returns it when set', () => {
    class Probe extends AmbossClient {
      check(): string {
        return this.requireServiceApiKey('test op');
      }
    }
    assert.throws(
      () => new Probe({}).check(),
      (err: unknown) => err instanceof ConfigError,
    );
    assert.equal(new Probe({ serviceApiKey: 'amb_live_test' }).check(), 'amb_live_test');
  });

  it('applies timeoutMs as an abort signal on requests', async () => {
    let receivedSignal: AbortSignal | undefined;
    const fetchImpl: typeof fetch = async (_input, init) => {
      receivedSignal = init?.signal ?? undefined;
      return new Response(JSON.stringify({ data: { ok: true } }), {
        headers: { 'content-type': 'application/json' },
      });
    };
    class Probe extends AmbossClient {
      run(): Promise<unknown> {
        return this.gqlRequest('{ ok }', undefined, 'Probe');
      }
    }
    await new Probe({ apiKey: 'sk_test', fetch: fetchImpl, timeoutMs: 5000 }).run();
    assert.ok(receivedSignal instanceof AbortSignal);
  });

  it('rejects a request that exceeds timeoutMs', async () => {
    const hangingFetch: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    class Probe extends AmbossClient {
      run(): Promise<unknown> {
        return this.gqlRequest('{ ok }', undefined, 'Probe');
      }
    }
    await assert.rejects(() =>
      new Probe({ apiKey: 'sk_test', fetch: hangingFetch, timeoutMs: 10 }).run(),
    );
  });
});
