#!/usr/bin/env node
// Put the token-economy guideline (클로드_최적화/클로드코드에_적용요청.md, the block between the markers) into the
// Claude Code user memory file %USERPROFILE%\.claude\CLAUDE.md, which every Claude Code session reads at start.
//
// Why: 2026-09-28 the user wants the friend's copy to apply the guideline to all of the friend's Claude sessions
// without relying on the friend asking Claude Code to do it. 설치.cmd runs this once and 실행.ps1 runs it on every
// start, so a newer guideline shipped by the auto-update replaces the old block.
//
// Safe to run again: unchanged block -> no write. Otherwise a backup CLAUDE.md.백업_YYYYMMDD_HHMM is made first and
// only the marked block is added or replaced; the rest of the file is left as it is.
// Skipped on the author's copy (a .git folder next to 도구) unless --force.
// Opt out: put the line <!-- 토큰 최적화 지침 끄기 --> anywhere in CLAUDE.md.
//
// Run:   node 도구\지침설치.js            add or refresh
//        node 도구\지침설치.js --remove   take the block out again (with a backup)
// Test:  OFFICE3D_CLAUDE_DIR=<dir> overrides %USERPROFILE%\.claude
"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "클로드_최적화", "클로드코드에_적용요청.md");
const START = "<!-- 토큰 최적화 지침 시작 -->";
const END = "<!-- 토큰 최적화 지침 끝 -->";
const OFF = "<!-- 토큰 최적화 지침 끄기 -->";
const DIR = process.env.OFFICE3D_CLAUDE_DIR || path.join(os.homedir(), ".claude");
const TARGET = path.join(DIR, "CLAUDE.md");
const args = process.argv.slice(2);

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

// markers count only on a line of their own: the instructions in the source md quote them inside a sentence
function blockOf(text) {
  const line = (m) => new RegExp(`^[ \\t]*${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[ \\t]*\\r?$`, "m");
  const s = line(START).exec(text);
  if (!s) return null;
  const rest = text.slice(s.index);
  const e = line(END).exec(rest);
  if (!e) return null;
  const a = s.index + s[0].indexOf(START);
  const b = s.index + e.index + e[0].indexOf(END) + END.length;
  return { a, b, block: text.slice(a, b) };
}

function backup(current) {
  let file = `${TARGET}.백업_${stamp()}`;
  for (let k = 2; fs.existsSync(file); k++) file = `${TARGET}.백업_${stamp()}_${k}`;
  fs.writeFileSync(file, current, "utf8");
  return path.basename(file);
}

function main() {
  if (fs.existsSync(path.join(ROOT, ".git")) && !args.includes("--force")) {
    console.log("지침: 만든 사람의 폴더(.git 있음)라 건너뜀");
    return 0;
  }
  const current = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, "utf8") : null;
  const have = current === null ? null : blockOf(current);

  if (args.includes("--remove")) {
    if (!have) { console.log("지침: 넣은 블록이 없음"); return 0; }
    const name = backup(current);
    const rest = (current.slice(0, have.a) + current.slice(have.b)).replace(/\n{3,}/g, "\n\n");
    fs.writeFileSync(TARGET, rest, "utf8");
    console.log(`지침: 뺌 (${TARGET}, 백업 ${name})`);
    return 0;
  }

  if (!fs.existsSync(SRC)) { console.error(`지침: 원본 없음 ${SRC}`); return 1; }
  const want = blockOf(fs.readFileSync(SRC, "utf8").replace(/\r\n/g, "\n"));
  if (!want) { console.error(`지침: 원본에 표시(${START} ... ${END})가 없음`); return 1; }

  if (current !== null && current.includes(OFF)) { console.log("지침: 끄기 표시가 있어 건너뜀"); return 0; }
  if (have && have.block.replace(/\r\n/g, "\n") === want.block) { console.log("지침: 이미 최신"); return 0; }

  fs.mkdirSync(DIR, { recursive: true });
  let next;
  let how;
  if (current === null) {
    next = `${want.block}\n`;
    how = "새로 만듦";
  } else if (have) {
    next = current.slice(0, have.a) + want.block + current.slice(have.b);
    how = "새 판으로 바꿈";
  } else {
    next = `${current.replace(/\s*$/, "")}\n\n${want.block}\n`;
    how = "끝에 붙임";
  }
  const name = current === null ? null : backup(current);
  fs.writeFileSync(TARGET, next, "utf8");
  console.log(`지침: ${how} (${TARGET}${name ? `, 백업 ${name}` : ""})`);
  return 0;
}

process.exit(main());
