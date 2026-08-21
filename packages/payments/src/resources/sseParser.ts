/** One dispatched Server-Sent Event, per the WHATWG SSE spec's field set (minus `retry`, which this SDK doesn't act on — see the note in `streaming.ts` about `Last-Event-ID`). */
export interface ParsedSseEvent {
  id?: string;
  event?: string;
  data: string;
}

/**
 * Parses a `text/event-stream` body into dispatched events. Reads the stream
 * manually via `getReader()`/`TextDecoder` (rather than `EventSource`, which
 * doesn't exist in Node and can't set custom headers) so it works in both
 * Node and browsers.
 *
 * Comment lines (`:...`, used by the server for heartbeats) are dropped
 * silently. `retry:` and any other unrecognized field is ignored — this SDK
 * never reconnects with `Last-Event-ID`, so there is nothing for `retry` to
 * configure.
 */
export async function* parseSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ParsedSseEvent, void, void> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let id: string | undefined;
  let event: string | undefined;
  let dataLines: string[] = [];

  const resetEvent = (): void => {
    id = undefined;
    event = undefined;
    dataLines = [];
  };

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;

        if (line === '') {
          if (dataLines.length > 0) {
            yield { id, event, data: dataLines.join('\n') };
          }
          resetEvent();
          continue;
        }
        if (line.startsWith(':')) continue;

        const colonIndex = line.indexOf(':');
        const field = colonIndex === -1 ? line : line.slice(0, colonIndex);
        let value2 = colonIndex === -1 ? '' : line.slice(colonIndex + 1);
        if (value2.startsWith(' ')) value2 = value2.slice(1);

        if (field === 'id') id = value2;
        else if (field === 'event') event = value2;
        else if (field === 'data') dataLines.push(value2);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
