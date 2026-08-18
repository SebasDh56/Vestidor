import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DATABASE_NAME = "vestidor-db";
const DATABASE_BINDING = "DB";
const GENERATED_CONFIG = resolve("dist", "server", "wrangler.json");
const WRANGLER_CLI = resolve("node_modules", "wrangler", "bin", "wrangler.js");

function runWrangler(args, captureOutput = false) {
  const result = spawnSync(process.execPath, [WRANGLER_CLI, ...args], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (captureOutput && result.stderr) process.stderr.write(result.stderr);
  return result;
}

function parseDatabaseList(output) {
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");
  if (start < 0 || end < start) return [];

  const parsed = JSON.parse(output.slice(start, end + 1));
  return Array.isArray(parsed) ? parsed : [];
}

function databaseId(database) {
  return database.uuid ?? database.id ?? database.database_id ?? null;
}

function attachExistingDatabase(id) {
  if (!existsSync(GENERATED_CONFIG)) {
    throw new Error("No existe dist/server/wrangler.json. Ejecuta npm run build antes del despliegue.");
  }

  const config = JSON.parse(readFileSync(GENERATED_CONFIG, "utf8"));
  const binding = config.d1_databases?.find((item) => item.binding === DATABASE_BINDING);
  if (!binding) throw new Error(`No se encontr\u00f3 el binding D1 ${DATABASE_BINDING}.`);

  binding.database_name = DATABASE_NAME;
  binding.database_id = id;
  writeFileSync(GENERATED_CONFIG, `${JSON.stringify(config)}\n`, "utf8");
  process.stdout.write(`Reutilizando la base D1 existente ${DATABASE_NAME}.\n`);
}

const listResult = runWrangler(["d1", "list", "--json"], true);
if (listResult.status !== 0) {
  process.stderr.write("No se pudo consultar D1 antes del despliegue.\n");
  process.exit(listResult.status ?? 1);
}

let databases;
try {
  databases = parseDatabaseList(listResult.stdout ?? "");
} catch (error) {
  process.stderr.write(`Cloudflare devolvi\u00f3 una lista D1 inv\u00e1lida: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

const matches = databases.filter((database) => database.name === DATABASE_NAME);
if (matches.length > 1) {
  process.stderr.write(`Hay m\u00e1s de una base llamada ${DATABASE_NAME}; corrige la duplicaci\u00f3n desde Cloudflare.\n`);
  process.exit(1);
}

if (matches.length === 1) {
  const id = databaseId(matches[0]);
  if (!id) {
    process.stderr.write(`Cloudflare no devolvi\u00f3 el identificador de ${DATABASE_NAME}.\n`);
    process.exit(1);
  }
  attachExistingDatabase(id);
} else {
  process.stdout.write(`No existe ${DATABASE_NAME}; Wrangler la aprovisionar\u00e1 en este primer despliegue.\n`);
}

const deployResult = runWrangler(["deploy"]);
process.exit(deployResult.status ?? 1);
