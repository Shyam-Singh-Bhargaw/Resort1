export function connectEvents(onEvent: (ev: any) => void) {
  const base = (import.meta as any).env?.VITE_API_URL || '';
  const url = `${base}/api/events/stream`;
  let es: EventSource | null = null;
  let retry = 1000;
  let closed = false;

  function start() {
    try {
      es = new EventSource(url, { withCredentials: false } as any);
    } catch (err) {
      scheduleRetry();
      return;
    }

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
      } catch (err) {
        // ignore malformed
      }
    };

    es.onerror = () => {
      if (es) {
        try { es.close(); } catch (e) {}
        es = null;
      }
      scheduleRetry();
    };
  }

  function scheduleRetry() {
    if (closed) return;
    setTimeout(() => {
      // exponential backoff capped at 30s
      retry = Math.min(30000, retry * 1.5);
      start();
    }, retry);
  }

  // start immediately
  start();

  return () => {
    closed = true;
    if (es) try { es.close(); } catch (e) {}
    es = null;
  };
}
