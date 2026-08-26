import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const demoRoot = resolve(siteRoot, "opennars-304-ts");
const requiredFiles = ["index.html", "styles.css", "app.js", "nars-worker.js", "build-meta.json"];

for (const file of requiredFiles) {
  const path = resolve(demoRoot, file);
  const size = statSync(path).size;
  if (size === 0) throw new Error(`${file} is empty`);
}

const html = readFileSync(resolve(demoRoot, "index.html"), "utf8");
for (const requiredText of ["NARS INTERACTIVE", "REASONER CONSOLE", "data-package-version", "data-build-time", "terminal-input"]) {
  if (!html.includes(requiredText)) throw new Error(`index.html is missing ${requiredText}`);
}

const app = readFileSync(resolve(demoRoot, "app.js"), "utf8");
for (const requiredText of ["new Worker", "ArrowUp", "Control", "build-meta.json"]) {
  if (!app.includes(requiredText)) throw new Error(`app.js is missing ${requiredText}`);
}

const worker = readFileSync(resolve(demoRoot, "nars-worker.js"), "utf8");
for (const requiredText of ["OpenNARS", "opennars-304-ts", "sourceCommit"]) {
  if (!worker.includes(requiredText)) throw new Error(`nars-worker.js is missing ${requiredText}`);
}

const metadata = JSON.parse(readFileSync(resolve(demoRoot, "build-meta.json"), "utf8"));
if (metadata.coreVersion !== "v3.0.4" || !/^\d+\.\d+\.\d+$/.test(metadata.packageVersion)) {
  throw new Error("build metadata versions are invalid");
}
if (!/^[0-9a-f]{40}$/.test(metadata.sourceCommit)) throw new Error("build metadata source commit is invalid");

console.log(JSON.stringify({
  ok: true,
  files: requiredFiles.length,
  packageVersion: metadata.packageVersion,
  coreVersion: metadata.coreVersion,
  sourceCommit: metadata.sourceCommit,
  builtAt: metadata.builtAt,
}, null, 2));
