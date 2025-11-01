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

const localesToBuild = [defaultLocale, ...targetLocales];

console.log("Building static output for locales:", localesToBuild.join(", "));

for (const locale of localesToBuild) {
  console.log(`\n▶ Building locale "${locale}"...`);
  const result = spawnSync(
    "npm",
    ["run", "docusaurus", "--", "build", "--locale", locale],
    {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );

  if (result.status !== 0) {
    console.error(`Build failed for locale "${locale}".`);
    process.exit(result.status ?? 1);
  }
}

console.log("\n✅ Localized builds complete. Remember to deploy the generated directories under build/<locale>/.");
