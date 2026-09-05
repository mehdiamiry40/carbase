import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run this gate with npm run verify:deployment.");

function run(args, env = process.env) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Vercel cannot publish an artifact until this entire command succeeds.
// Keep the build itself on the normal Next.js compiler and configuration.
run(["run", "check"]);

let deploymentBrowser;
if (process.env.VERCEL === "1" && process.platform === "linux") {
  // Vercel's Linux build image is not Playwright's Ubuntu CI image. This
  // pinned, build-only Chromium includes the required runtime libraries.
  const { default: chromium } = await import("@sparticuz/chromium");
  deploymentBrowser = {
    executablePath: await chromium.executablePath(),
    // A build container can use separate renderer processes. Keep normal web
    // origin protections; the tests do not need the package's permissive flags.
    args: chromium.args.filter((arg) => ![
      "--single-process",
      "--allow-running-insecure-content",
      "--disable-web-security",
      "--disable-site-isolation-trials",
    ].includes(arg)),
  };
}

// The Chromium helper sets library/font paths during initialization, so copy
// the environment afterward and pass those paths to the Playwright process.
const browserEnv = { ...process.env, CI: "true" };
for (const key of ["RESEND_API_KEY", "BLOB_READ_WRITE_TOKEN", "CRON_SECRET"]) {
  delete browserEnv[key];
}
if (deploymentBrowser) {
  browserEnv.CARBASE_DEPLOY_BROWSER_CONFIG = JSON.stringify(deploymentBrowser);
}

run(["run", "test:e2e", "--", "--reporter=line"], browserEnv);
console.log("Deployment verification passed: tests, types, lint, build and browser checks.");
