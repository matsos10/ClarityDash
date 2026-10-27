import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { todayISO } from "../../src/lib/dates";

const DIR = process.env.BACKUP_DIR ?? "./backups";
const KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS ?? 30);

/** pg_dump compressé quotidien + rotation. */
export async function backup() {
  await mkdir(DIR, { recursive: true });
  const file = path.join(DIR, `palmela-${todayISO()}.sql.gz`);
  const dump = spawn("pg_dump", ["--no-owner", "--no-privileges", process.env.DATABASE_URL!], { stdio: ["ignore", "pipe", "inherit"] });
  const exited = new Promise<number>((resolve) => dump.on("close", (code) => resolve(code ?? 1)));
  await pipeline(dump.stdout, createGzip(), createWriteStream(file));
  if ((await exited) !== 0) throw new Error("pg_dump a échoué");

  const limit = Date.now() - KEEP_DAYS * 86_400_000;
  for (const f of await readdir(DIR)) {
    const full = path.join(DIR, f);
    if (f.startsWith("palmela-") && (await stat(full)).mtimeMs < limit) await unlink(full);
  }
  console.log(`[backup] ${file}`);
}
