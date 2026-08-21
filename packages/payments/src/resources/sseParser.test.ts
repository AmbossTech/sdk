import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseSseStream } from './sseParser.js';

/** Turns SSE wire text into the chunked byte stream `parseSseStream` reads. */
function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[i]));
      i += 1;
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const events = [];
  for await (const event of parseSseStream(stream)) events.push(event);
  return events;
}

describe('parseSseStream', () => {
  it('parses id/event/data fields from a single dispatched event', async () => {
    const events = await collect(
      streamOf(['id: evt-1\nevent: payment.completed\ndata: {"a":1}\n\n']),
    );
    assert.deepEqual(events, [{ id: 'evt-1', event: 'payment.completed', data: '{"a":1}' }]);
  });

  it('joins multiple data: lines with newlines, per the SSE spec', async () => {
    const events = await collect(streamOf(['data: line1\ndata: line2\n\n']));
    assert.deepEqual(events, [{ id: undefined, event: undefined, data: 'line1\nline2' }]);
  });

  it('ignores comment lines used for heartbeats', async () => {
    const events = await collect(streamOf([': keepalive\n\ndata: real\n\n']));
    assert.deepEqual(events, [{ id: undefined, event: undefined, data: 'real' }]);
  });

  it('reassembles an event split across multiple chunks', async () => {
    const events = await collect(streamOf(['event: pay', 'ment.pending\ndata: {"x":2}', '\n\n']));
    assert.deepEqual(events, [{ id: undefined, event: 'payment.pending', data: '{"x":2}' }]);
  });

  it('dispatches multiple events from one stream in order', async () => {
    const events = await collect(streamOf(['data: first\n\ndata: second\n\n']));
    assert.deepEqual(
      events.map((e) => e.data),
      ['first', 'second'],
    );
  });

  it('drops an eventless trailing buffer with no blank-line terminator', async () => {
    const events = await collect(streamOf(['data: complete\n\ndata: incomplete']));
    assert.deepEqual(
      events.map((e) => e.data),
      ['complete'],
    );
  });
});
