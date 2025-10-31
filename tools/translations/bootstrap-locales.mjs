import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import config from "../../docusaurus.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

const { i18n = {} } = config;
const { locales = ["en"], defaultLocale = "en" } = i18n;
const targetLocales = locales.filter((locale) => locale !== defaultLocale);

if (targetLocales.length === 0) {
  console.log("No additional locales configured. Nothing to bootstrap.");
  process.exit(0);
}

console.log("Bootstrapping translation assets for locales:", targetLocales.join(", "));

for (const locale of targetLocales) {
  console.log(`\n▶ Generating translation bundle for "${locale}"...`);
  const result = spawnSync(
    "npm",
    ["run", "write-translations", "--", "--locale", locale],
    {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );

  if (result.status !== 0) {
    console.error(`Failed to extract strings for locale "${locale}".`);
    process.exit(result.status ?? 1);
  }
}

console.log("\n✅ Locale bootstrap complete. Review files under the i18n/ directory and translate them as needed.");
