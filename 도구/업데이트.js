// ============================================================
// 3D 사무실 자동 업데이트 (친구 PC 용)
// 왜: 만든 사람이 고친 판을 친구가 손대지 않고 받게 한다(2026-09-28 사용자 요청).
//     실행.ps1 이 서버를 켜기 전에 부른다(서버가 이미 떠 있으면 부르지 않는다).
// 하는 일: 공개 저장소(github.com/sheahe0220/3d-office-share)의 manifest.json 을 읽고, 새 판이면
//   바뀐 파일만 그 판의 태그 주소에서 받아 SHA256 을 맞춘 뒤 바꾼다. 하나라도 어긋나면 아무것도 바꾸지 않는다.
//   바꾸기 전 파일은 _이전판\<옛 판>\ 에 둔다(최근 3 개). 훅설치.js 가 바뀌면 훅을 다시 등록한다.
//   실패하면 지금 판 그대로 두고 업데이트.log 에 적는다(실행은 계속된다).
// PowerShell 다운로드 명령은 쓰지 않는다: Windows Defender 가 cmd -> PowerShell 다운로드 형태를
//   Trojan:Win32/ClickFix 로 잡는다(2026-09-28 이 PC 에서 실측).
// 만든 사람의 폴더(.git 이 있는 곳)에서는 아무것도 하지 않는다.
// 다시 실행: node 도구\업데이트.js          되돌리기: node 도구\업데이트.js --rollback
// 시험용: 환경변수 OFFICE3D_UPDATE_BASE 에 manifest.json 과 파일들이 있는 폴더
// ============================================================
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const LOG = path.join(ROOT, "업데이트.log");
const BACKUP = path.join(ROOT, "_이전판");
const VERSION_FILE = path.join(ROOT, "VERSION");
const RAW = "https://raw.githubusercontent.com/sheahe0220/3d-office-share";
const LOCAL_BASE = process.env.OFFICE3D_UPDATE_BASE || "";
const KEEP_BACKUPS = 3;
const TIMEOUT_MS = 20000;

function log(msg) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const line = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${msg}`;
  fs.appendFileSync(LOG, line + "\n", "utf8");
  console.log(line);
}

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const localVersion = () => (fs.existsSync(VERSION_FILE) ? fs.readFileSync(VERSION_FILE, "utf8").trim() : "");

async function get(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

async function readManifest() {
  if (LOCAL_BASE) return JSON.parse(fs.readFileSync(path.join(LOCAL_BASE, "manifest.json"), "utf8"));
  return JSON.parse((await get(`${RAW}/main/manifest.json?t=${Date.now()}`)).toString("utf8"));
}

async function readRemoteFile(m, rel) {
  if (LOCAL_BASE) return fs.readFileSync(path.join(LOCAL_BASE, rel));
  return get(`${RAW}/${encodeURIComponent(m.tag)}/${rel.split("/").map(encodeURIComponent).join("/")}`);
}

function safeRel(rel) {
  const abs = path.resolve(ROOT, rel);
  if (!abs.startsWith(ROOT + path.sep)) throw new Error(`이상한 경로: ${rel}`);
  return abs;
}

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(p, base) : [path.relative(base, p).split(path.sep).join("/")];
  });
}

function copyInto(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

async function update() {
  const m = await readManifest();
  if (!m.version || !m.files || typeof m.files !== "object") throw new Error("manifest.json 형식이 이상함");
  const cur = localVersion();
  if (m.version === cur) return;

  // 1) download every changed file and check it before touching anything
  const fresh = new Map();
  for (const [rel, want] of Object.entries(m.files)) {
    const abs = safeRel(rel);
    if (fs.existsSync(abs) && sha256(fs.readFileSync(abs)) === want) continue;
    const buf = await readRemoteFile(m, rel);
    if (sha256(buf) !== want) throw new Error(`받은 파일이 손상됨(SHA256 불일치): ${rel}`);
    fresh.set(rel, buf);
  }

  // 2) back up what is replaced, plus dist files the new build no longer has
  const bk = path.join(BACKUP, cur || "처음판");
  fs.rmSync(bk, { recursive: true, force: true });
  for (const rel of fresh.keys()) {
    const abs = safeRel(rel);
    if (fs.existsSync(abs)) copyInto(abs, path.join(bk, rel));
  }
  if (fs.existsSync(VERSION_FILE)) copyInto(VERSION_FILE, path.join(bk, "VERSION"));
  const stale = listFiles(path.join(ROOT, "dist")).map((r) => "dist/" + r).filter((r) => !(r in m.files));
  for (const rel of stale) {
    copyInto(safeRel(rel), path.join(bk, rel));
    fs.rmSync(safeRel(rel));
  }

  // 3) write (tmp + rename per file), VERSION last
  const hookInstaller = "도구/훅설치.js";
  for (const [rel, buf] of fresh) {
    const abs = safeRel(rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs + ".upd-tmp", buf);
    fs.renameSync(abs + ".upd-tmp", abs);
  }
  fs.writeFileSync(VERSION_FILE, m.version + "\n", "utf8");

  const olds = fs.readdirSync(BACKUP, { withFileTypes: true }).filter((e) => e.isDirectory())
    .map((e) => ({ n: e.name, t: fs.statSync(path.join(BACKUP, e.name)).mtimeMs })).sort((a, b) => b.t - a.t);
  for (const o of olds.slice(KEEP_BACKUPS)) fs.rmSync(path.join(BACKUP, o.n), { recursive: true, force: true });

  if (fresh.has(hookInstaller) && !process.env.OFFICE3D_NO_HOOKS) {
    execFileSync(process.execPath, [safeRel(hookInstaller)], { stdio: "ignore" });
    log("훅을 다시 등록함");
  }
  log(`업데이트 완료: ${cur || "(판 표시 없음)"} -> ${m.version} | 바뀐 파일 ${fresh.size} 개, 뺀 파일 ${stale.length} 개` +
      (m.memo ? ` | ${m.memo}` : ""));
  process.exitCode = 10; // 실행.ps1 restarts a running server when it sees this
}

function rollback() {
  if (!fs.existsSync(BACKUP)) return log("되돌릴 이전 판이 없습니다");
  const last = fs.readdirSync(BACKUP, { withFileTypes: true }).filter((e) => e.isDirectory())
    .map((e) => ({ n: e.name, t: fs.statSync(path.join(BACKUP, e.name)).mtimeMs })).sort((a, b) => b.t - a.t)[0];
  if (!last) return log("되돌릴 이전 판이 없습니다");
  const src = path.join(BACKUP, last.n);
  for (const rel of listFiles(src)) copyInto(path.join(src, rel), safeRel(rel));
  if (!fs.existsSync(path.join(src, "VERSION"))) fs.rmSync(VERSION_FILE, { force: true });
  log(`이전 판으로 되돌림: ${last.n}`);
}

(async () => {
  if (fs.existsSync(path.join(ROOT, ".git"))) return; // the author's working copy updates through git
  try {
    if (process.argv.includes("--rollback")) rollback();
    else await update();
  } catch (e) {
    try { log(`업데이트 건너뜀(지금 판으로 실행): ${e.message}`); } catch { /* read-only folder */ }
  }
})();
