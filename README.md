# Firewall Defence

A browser-based cybersecurity tower defence game. Protect a simulated server by deploying and upgrading defensive controls against escalating attack waves.

## Play locally

Requires a modern browser and Node.js 20+ for tests, or Python 3 for the local web server.

```sh
python -m http.server 8000
```

Open http://localhost:8000 in your browser. The game has no build step, runtime dependencies, API keys, backend, telemetry or real network attack functionality. It can also be deployed as a static site on GitHub Pages or Vercel. Serve the repository root.

## Gameplay

- Three network maps: Edge Gateway, Cloud Perimeter and Data Centre.
- Three difficulty settings, a 15-wave campaign and endless mode.
- Six defensive controls: firewall, IDS, rate limiter, IPS, WAF and traffic scrubber.
- Six simulated threat types, including advanced threats every fifth wave.
- Deploy, upgrade to level three, sell, prioritise targets and repair the server.
- Inspect ranges, forecast incoming threats and review the live event log.
- Pause, resume, and change simulation speed. Local personal best persists between completed missions.
- Keyboard shortcuts: 1 through 6 select a defence, N starts a wave, Space pauses or resumes, and Escape clears selection when focus is not on an interactive control.

IDS does not block threats directly. It reveals stealth traffic and increases damage against marked threats. Rate limiting slows traffic. Combine defences for broader coverage. The mechanics are simplified fictional abstractions for education, not a faithful network simulator.

## Tests

```sh
node --test engine.test.mjs
node --check app.mjs
```

The engine is deterministic and independent of the DOM. Regression tests cover map geometry, deployment constraints, economic rules, wave completion, detection, slowing, victory, defeat and difficulty.

## Project layout

- `engine.mjs`: simulation and game rules.
- `app.mjs`: input, rendering, accessible controls and local score storage.
- `index.html`, `style.css`: responsive operations dashboard.
- `engine.test.mjs`: automated regression tests.

All attack traffic is simulated entirely within the browser. No external scanning, traffic generation, tracking or credentials are used.
