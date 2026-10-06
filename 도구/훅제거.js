// ============================================================
// 3D 사무실 훅 제거기
// 왜 있는가: 이 도구를 쓰지 않게 될 때 ~/.claude/settings.json 에서
// 우리 훅(claude-hook.js 를 부르는 항목)만 걷어낸다. 남의 훅은 남긴다.
// 다시 실행: node 훅제거.js
// ============================================================
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");

const SETTINGS = path.join(os.homedir(), ".claude", "settings.json");

function isOurs(command) {
  return typeof command === "string" && command.includes("claude-hook.js");
}

function main() {
  if (!fs.existsSync(SETTINGS)) {
    console.log("settings.json 이 없습니다. 할 일 없음.");
    return;
  }
  let s;
  try {
    s = JSON.parse(fs.readFileSync(SETTINGS, "utf8"));
  } catch (e) {
    console.error("settings.json 을 해석할 수 없어 중단합니다(파일 보호).", e.message);
    process.exit(1);
  }
  if (!s.hooks || typeof s.hooks !== "object" || Array.isArray(s.hooks)) {
    console.log("훅 항목이 없습니다. 할 일 없음.");
    return;
  }
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
  if (Object.keys(s.hooks).length === 0) delete s.hooks;
  const tmp = SETTINGS + ".v2-tmp";
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, SETTINGS);
  console.log(`훅 제거 완료: ${removed}건 걷어냄`);
}

main();
