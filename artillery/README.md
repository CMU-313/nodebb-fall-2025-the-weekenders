Artillery dynamic analysis

What it does
- Runs a short smoke test against NodeBB health endpoints (`/sping`, `/ping`).
- Uses CI environment prefix `/forum`; local default is no prefix.

How to run locally
1) Start NodeBB at `http://127.0.0.1:4567`.
2) Option A (without local install):
   - `npx artillery run -o artillery/results/smoke.json artillery/artillery-smoke.yml`
   - `npx artillery report artillery/results/smoke.json -o artillery/results/smoke.html`
3) Option B (if you copy `install/package.json` to root):
   - `npm run test:artillery`

Outputs
- JSON: `artillery/results/smoke.json`
- HTML: `artillery/results/smoke.html`

CI workflow
- `.github/workflows/artillery.yaml` starts NodeBB, runs this scenario, and uploads the `artillery/results` directory as a build artifact.

