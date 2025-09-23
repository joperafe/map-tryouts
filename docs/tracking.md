Tracking in map-tryouts

Overview
- A lightweight tracking service is available at `src/services/trackingService.ts`.
- It queues events, persists to localStorage, and flushes to a configured endpoint if provided in settings.

Usage
- Use the `useTracking` hook from `src/hooks/useTracking.ts` in React components:

  const { track } = useTracking();
  track('theme.toggle', { mode: 'dark' });

Configuration
- Add a `TRACKING` block to your environment settings (optional):

  "TRACKING": {
    "endpoint": "https://your-collector.example.com/track",
    "flushInterval": 30000
  }

Privacy
- Tracking data is queued locally and only sent if `TRACKING.endpoint` is configured.
- Avoid sending PII. If necessary, ensure the endpoint is secure and compliant with regulations.
