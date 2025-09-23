// Lightweight tracking service
// - Queues events in memory
// - Persists queued events to localStorage as a fallback
// - Attempts to flush to a configured server endpoint

import { getCurrentConfig } from '../config/settings';

type TrackingEvent = {
  name: string;
  props?: Record<string, unknown>;
  timestamp: string;
  userId?: string | number | null;
};

class TrackingService {
  private queue: TrackingEvent[] = [];
  private storageKey = 'app_tracking_queue_v1';
  private flushUrl: string | null = null;
  private flushInterval = 30_000; // 30s
  private timerId: number | null = null;

  constructor() {
    // Read optional tracking config (guarded - settings shape may not include TRACKING)
    const cfg = getCurrentConfig() as unknown as Record<string, unknown> | null;
    if (cfg && typeof cfg === 'object' && 'TRACKING' in cfg) {
      type TrackingCfg = { endpoint?: string; flushInterval?: number };
      const tracking = (cfg as Record<string, unknown>)['TRACKING'] as TrackingCfg | undefined;
      this.flushUrl = tracking?.endpoint || null;
      this.flushInterval = tracking?.flushInterval || this.flushInterval;
    }

    // hydrate queue from storage
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        this.queue = JSON.parse(raw) as TrackingEvent[];
      } catch {
        // ignore malformed stored payload
      }
    }

    // start periodic flush
    this.startTimer();
  }

  track(name: string, props?: Record<string, unknown>, userId?: string | number | null) {
    const ev: TrackingEvent = {
      name,
      props: props || {},
      timestamp: new Date().toISOString(),
      userId: userId ?? null,
    };
    this.queue.push(ev);
    this.persistQueue();

    // best-effort immediate flush
    this.flush().catch(() => {});
  }

  private persistQueue() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch {
      // ignore storage errors
    }
  }

  async flush() {
    if (!this.flushUrl || this.queue.length === 0) return;

    const payload = { events: [...this.queue] };

    try {
      const resp = await fetch(this.flushUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        // clear queue
        this.queue = [];
        this.persistQueue();
      }
    } catch {
      // network errors - keep queue for retry
    }
  }

  startTimer() {
    if (this.timerId) return;
    this.timerId = window.setInterval(() => this.flush().catch(() => {}), this.flushInterval);
  }

  stopTimer() {
    if (!this.timerId) return;
    clearInterval(this.timerId);
    this.timerId = null;
  }
}

export const trackingService = new TrackingService();

export type { TrackingEvent };
