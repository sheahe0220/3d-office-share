// ============================================================
// 3D 사무실 훅 설치기 (이식용)
// 왜 있는가: 다른 컴퓨터에 폴더만 복사했을 때, 클로드 코드가 이
// 폴더의 훅 스크립트(dist\hooks\claude-hook.js)로 이벤트를 보내게
// ~/.claude/settings.json 에 훅 8종을 등록한다.
// 다시 실행: node 훅설치.js   (제거: node 훅제거.js)
//
// 안전 규칙(원본 저장소의 설치기와 같은 원칙):
// - settings.json 이 깨져 읽을 수 없으면 아무것도 쓰지 않는다.
// - 남의 훅은 건드리지 않는다. 우리 것(claude-hook.js)만 지우고 다시 넣는다.
// - 처음 고치기 전 1회 백업(.agent-office-v2.backup), 원자적 쓰기(tmp+rename).
// ============================================================
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");

const EVENTS = ["PreToolUse", "PostToolUse", "Stop", "Notification", "SessionStart", "SessionEnd", "SubagentStop", "UserPromptSubmit"];
const SETTINGS = path.join(os.homedir(), ".claude", "settings.json");
const HOOK_SCRIPT = path.join(__dirname, "..", "dist", "hooks", "claude-hook.js");
const CMD = `node "${HOOK_SCRIPT}"`;

function isOurs(command) {
  return typeof command === "string" && command.includes("claude-hook.js");
}

function main() {
  if (!fs.existsSync(HOOK_SCRIPT)) {
    console.error("훅 스크립트가 없습니다:", HOOK_SCRIPT);
    process.exit(1);
  }
  let s = {};
  if (fs.existsSync(SETTINGS)) {
    const raw = fs.readFileSync(SETTINGS, "utf8");
    if (raw.trim()) {
      try {
        s = JSON.parse(raw);
      } catch (e) {
        console.error("~/.claude/settings.json 을 해석할 수 없어 중단합니다(파일 보호).", e.message);
        process.exit(1);
      }
    }
    // 처음 고치기 전 1회 백업 (있으면 그대로 둔다)
    const bak = SETTINGS + ".agent-office-v2.backup";
    if (!fs.existsSync(bak)) fs.copyFileSync(SETTINGS, bak);
  }
  if (!s.hooks || typeof s.hooks !== "object" || Array.isArray(s.hooks)) s.hooks = {};

  // 우리 훅(claude-hook.js 를 부르는 항목)만 전 이벤트에서 걷어낸다
  let removed = 0;
  for (const ev of Object.keys(s.hooks)) {
    if (!Array.isArray(s.hooks[ev])) continue;
    s.hooks[ev] = s.hooks[ev]
      .map((g) => {
        if (!g || !Array.isArray(g.hooks)) return g;
        const kept = g.hooks.filter((h) => {
          const ours = h && isOurs(h.command);
          if (ours) removed++;
          return !ours;
        });
        return { ...g, hooks: kept };
      })
      .filter((g) => !g || !Array.isArray(g.hooks) || g.hooks.length > 0);
    if (s.hooks[ev].length === 0) delete s.hooks[ev];
  }

  // 이 폴더의 스크립트로 8종 등록
  let added = 0;
  for (const ev of EVENTS) {
    if (!Array.isArray(s.hooks[ev])) s.hooks[ev] = [];
    s.hooks[ev].push({ matcher: "*", hooks: [{ type: "command", command: CMD, timeout: 5 }] });
    added++;
  }

  fs.mkdirSync(path.dirname(SETTINGS), { recursive: true });
  const tmp = SETTINGS + ".v2-tmp";
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, SETTINGS);
  console.log(`훅 설치 완료: 기존 우리 항목 ${removed}건 정리, ${added}건 등록`);
  console.log("스크립트:", HOOK_SCRIPT);
  if (added !== EVENTS.length) process.exit(1);
}

main();
