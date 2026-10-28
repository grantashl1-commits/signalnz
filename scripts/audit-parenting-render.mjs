// Render the current course in jsdom, including browser-only reflection persistence.
// Historical audit JSON remains unchanged as evidence of the original findings.
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', 'src/components/connect/__tests__/ParentingActivities.test.tsx'], { stdio: 'inherit' });
process.exitCode = result.status ?? 1;
