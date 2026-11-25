# Firewall Defence

**[Play Firewall Defence](https://firewall-defence.vercel.app/)**
A browser-based cybersecurity tower defence game. Protect a simulated server by deploying and upgrading defensive controls against escalating attack waves.

## Play locally

Requires a modern browser and Node.js 20+ for tests, or Python 3 for the local web server.

```sh
python -m http.server 8000
```

Open http://localhost:8000 in your browser. The game has no build step, runtime dependencies, API keys, backend, telemetry or real network attack functionality. It can also be deployed as a static site. The Vercel build stages only the five runtime assets.

## Gameplay

- Five network maps: Edge Gateway, Cloud Perimeter, Data Centre, Campus Network and Industrial Control.
- Three difficulty settings, a 15-wave campaign and endless mode.
- Nine defensive controls: firewall, IDS, rate limiter, IPS, WAF, traffic scrubber, honeypot, endpoint guard and secure proxy.
- Nine simulated threat types, including advanced threats every fifth wave.
- Deploy, upgrade to level three, sell, prioritise targets and repair the server.
- Inspect ranges, forecast incoming threats and review the live event log.
- Pause, resume, and change simulation speed. Local personal best persists between completed missions.
- Keyboard shortcuts: 1 through 9 select a defence, N starts a wave, Space pauses or resumes, and Escape clears selection when focus is not on an interactive control.

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

## Vercel release

Vercel builds the main branch and runs the engine regression suite before staging runtime assets. GitHub Actions separately runs the cross-browser suite on main and pull requests.

Run browser checks locally using Node.js 22 and Python 3:

```sh
npm install --no-save --package-lock=false @playwright/test@1.56.1
npx playwright install chromium firefox webkit
npx playwright test
```

The browser suite covers deployment, upgrades, selling, invalid route tiles, mission settings, pause and speed controls, the field manual, reset confirmation, keyboard shortcuts, viewport overflow and corrupted local storage. The engine suite plays through all 15 waves in all fifteen map/difficulty combinations. Vercel serves restrictive security headers in addition to the HTML meta Content Security Policy and referrer policy. No outbound API requests or external scripts are needed.

## Operations expansion

- Three permanent-within-mission research tracks, each with three levels: damage, range and kill credits.
- Four emergency actions: scan, EMP, freeze and shield. These spend credits and have individual cooldowns.
- Five targeting priorities, per-node damage and kill statistics, per-threat breakdown, wave history and persistent local achievements.
- Automatic next-wave countdown (optional), wave progress, live shield capacity, range previews and all-range overlay, reduced visual effects, threat labels and clearable logs.
- A detailed operation report, including expenditure, repairs, upgrades and incident response actions.

All simulation changes remain offline and deterministic. Progression is stored only for completed personal best scores and earned achievements; active missions are not saved.
