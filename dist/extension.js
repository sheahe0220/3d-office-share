"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// extension/vscode/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode5 = __toESM(require("vscode"));

// extension/vscode/hookInstaller.ts
var fs = __toESM(require("node:fs"));
var os = __toESM(require("node:os"));
var path = __toESM(require("node:path"));
var EVENTS = [
  "PreToolUse",
  "PostToolUse",
  "Stop",
  "Notification",
  "SessionStart",
  "SessionEnd",
  "SubagentStop",
  "UserPromptSubmit"
];
function defaultSettingsPath() {
  return path.join(os.homedir(), ".claude", "settings.json");
}
function hookCommand(hookScriptPath) {
  return `node "${hookScriptPath}"`;
}
function isOurHook(command) {
  return typeof command === "string" && command.includes("claude-hook.js");
}
function readSettings(settingsFile) {
  if (!fs.existsSync(settingsFile)) return { settings: {}, readable: true };
  let text;
  try {
    text = fs.readFileSync(settingsFile, "utf8");
  } catch {
    return { settings: {}, readable: false };
  }
  if (!text.trim()) return { settings: {}, readable: true };
  try {
    return { settings: JSON.parse(text), readable: true };
  } catch {
    return { settings: {}, readable: false };
  }
}
function writeSettingsAtomic(settingsFile, s) {
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  const tmp = `${settingsFile}.agent-office-${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, settingsFile);
}
function stripOurHooks(s) {
  if (!s.hooks) return;
  for (const e of Object.keys(s.hooks)) {
    s.hooks[e] = (s.hooks[e] || []).map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !isOurHook(h.command)) })).filter((g) => (g.hooks || []).length > 0);
    if (s.hooks[e].length === 0) delete s.hooks[e];
  }
}
function installHooks(hookScriptPath, settingsFile = defaultSettingsPath()) {
  try {
    const { settings: s, readable } = readSettings(settingsFile);
    if (!readable) return false;
    if (!s.hooks) s.hooks = {};
    const before = JSON.stringify(s.hooks);
    stripOurHooks(s);
    const cmd = hookCommand(hookScriptPath);
    for (const e of EVENTS) {
      (s.hooks[e] || (s.hooks[e] = [])).push({ matcher: "*", hooks: [{ type: "command", command: cmd, timeout: 5 }] });
    }
    if (JSON.stringify(s.hooks) === before) return true;
    writeSettingsAtomic(settingsFile, s);
    return true;
  } catch {
    return false;
  }
}
function uninstallHooks(_hookScriptPath, settingsFile = defaultSettingsPath()) {
  try {
    const { settings: s, readable } = readSettings(settingsFile);
    if (!readable || !s.hooks) return;
    stripOurHooks(s);
    writeSettingsAtomic(settingsFile, s);
  } catch {
  }
}

// extension/vscode/OfficeViewProvider.ts
var fs8 = __toESM(require("node:fs"));
var os6 = __toESM(require("node:os"));
var path7 = __toESM(require("node:path"));
var vscode4 = __toESM(require("vscode"));

// extension/core/attention.ts
var STUCK_MS = 3 * 6e4;
function summarize(agents) {
  let waiting = 0, blocked = 0;
  for (const a of agents) {
    if (a.permissionActive) waiting++;
    if (a.blocked) blocked++;
  }
  return { total: agents.length, waiting, blocked };
}
function statusText(a) {
  let s = `$(organization) ${a.total}`;
  if (a.waiting > 0) s += ` $(bell) ${a.waiting}`;
  if (a.blocked > 0) s += ` $(error) ${a.blocked}`;
  return s;
}
function needsAttention(a) {
  return a.waiting > 0 || a.blocked > 0;
}
var MAX_NAME_LEN = 32;
function sanitizeName(raw) {
  if (typeof raw !== "string") return "";
  const s = raw.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return s.length > MAX_NAME_LEN ? s.slice(0, MAX_NAME_LEN) : s;
}
function newlyStuck(since, already, now) {
  const out = [];
  for (const [id, t] of since) {
    if (already.has(id)) continue;
    if (now - t >= STUCK_MS) out.push(id);
  }
  return out;
}

// extension/core/constants.ts
var CLAUDE_TERMINAL_NAME_PREFIX = "Claude Code";
var FILE_WATCHER_POLL_INTERVAL_MS = 500;
var MAX_READ_BYTES = 65536;
var MAX_LINE_CHARS = 8e6;
var PROJECT_SCAN_INTERVAL_MS = 1e3;
var TEXT_IDLE_DELAY_MS = 5e3;
var TOOL_DONE_DELAY_MS = 300;
var PERMISSION_TIMER_FAST_MS = 5e3;
var PERMISSION_TIMER_SLOW_MS = 4e4;
var READING_TOOLS = /* @__PURE__ */ new Set([
  "Read",
  "Grep",
  "Glob",
  "LS",
  "NotebookRead",
  "WebFetch",
  "WebSearch"
]);
var SUBAGENT_TOOL_NAMES = /* @__PURE__ */ new Set(["Task", "Agent"]);
var INSTANT_WRITE_TOOLS = /* @__PURE__ */ new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
var PERMISSION_EXEMPT_TOOLS = /* @__PURE__ */ new Set([
  "Task",
  "Agent",
  "AskUserQuestion",
  "TodoWrite",
  "Read",
  "Grep",
  "Glob",
  "LS",
  "NotebookRead",
  "WebFetch",
  "WebSearch"
]);
var MAX_CONTEXT_TOKENS = 2e5;
var CONTEXT_WINDOW_1M = 1e6;
function contextWindowForModel(model) {
  if (!model) return MAX_CONTEXT_TOKENS;
  const m = model.toLowerCase();
  if (m.includes("1m")) return CONTEXT_WINDOW_1M;
  if (m.includes("haiku")) return MAX_CONTEXT_TOKENS;
  if (/fable|mythos|opus-5|opus-4-[6-9]|sonnet-5|sonnet-4-[6-9]/.test(m)) return CONTEXT_WINDOW_1M;
  return MAX_CONTEXT_TOKENS;
}

// extension/vscode/statusBar.ts
var vscode = __toESM(require("vscode"));
var OfficeStatusBar = class {
  item;
  /** Qadalgan (pin) agent uchun ALOHIDA element — asosiy xulosaga tegmaydi.
   *  Xarajat webview'da hisoblanadi (yagona manba), bu yerda faqat ko'rsatiladi. */
  pinItem;
  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.command = "agent-office.showPanel";
    this.pinItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    this.pinItem.command = "agent-office.showPanel";
  }
  /** Qadalgan agentni yangilaydi (label=null → yashiriladi). statusBar sozlamasiga
   *  bo'ysunadi (asosiy element bilan bir xil). */
  setPinned(label, cost) {
    const on = vscode.workspace.getConfiguration("agent-office").get("statusBar", true);
    if (!on || !label) {
      this.pinItem.hide();
      return;
    }
    const c = cost > 0 ? ` ~$${cost.toFixed(2)}` : "";
    this.pinItem.text = `$(pin) ${label}${c}`;
    this.pinItem.tooltip = `Agent Office \u2014 ${label}${c ? ` \xB7 ${c.trim()}` : ""}`;
    this.pinItem.show();
  }
  /** Agentlar holatini status barда yangilaydi (agent yo'q → yashiriladi). */
  update(agents) {
    const on = vscode.workspace.getConfiguration("agent-office").get("statusBar", true);
    if (!on || agents.length === 0) {
      this.item.hide();
      return;
    }
    const a = summarize(agents);
    this.item.text = statusText(a);
    this.item.backgroundColor = needsAttention(a) ? new vscode.ThemeColor("statusBarItem.warningBackground") : void 0;
    const md = new vscode.MarkdownString();
    md.appendMarkdown("**Agent Office**\n\n");
    for (const g of agents) {
      const state = g.blocked ? "\u26D4 bloklangan" : g.permissionActive ? g.stuck ? "\u{1F64B} uzoq kutmoqda" : "\u{1F514} ruxsat kutmoqda" : "\u{1F7E2} ishlamoqda";
      const why = g.blocked && g.reason ? ` \u2014 _${g.reason.slice(0, 90)}_` : "";
      md.appendMarkdown(`- ${g.folderName} \u2014 ${state}${why}
`);
    }
    md.appendMarkdown("\n_Ofisni ochish uchun bosing_");
    this.item.tooltip = md;
    this.item.show();
  }
  dispose() {
    this.item.dispose();
    this.pinItem.dispose();
  }
};

// extension/server/agentStateStore.ts
var import_node_events = require("node:events");
var AgentStateStore = class extends import_node_events.EventEmitter {
  agents = /* @__PURE__ */ new Map();
  nextId = 1;
  /** >0 bo'lsa broadcast'lar o'chiriladi (tarixni jimgina o'qish uchun).
   *  FAQAT sinxron blok davomida ishlatiladi (tick oraliqda tushmaydi). */
  silent = 0;
  /** Keyingi agent uchun ID ajratadi. */
  allocateId() {
    return this.nextId++;
  }
  add(agent) {
    this.agents.set(agent.id, agent);
    this.emit("agentAdded", agent);
  }
  remove(id) {
    const agent = this.agents.get(id);
    if (!agent) return;
    if (agent.waitingTimer) clearTimeout(agent.waitingTimer);
    if (agent.permissionTimer) clearTimeout(agent.permissionTimer);
    this.agents.delete(id);
    this.emit("agentRemoved", id);
  }
  get(id) {
    return this.agents.get(id);
  }
  has(id) {
    return this.agents.has(id);
  }
  get size() {
    return this.agents.size;
  }
  values() {
    return [...this.agents.values()];
  }
  /** Fayl yo'li bo'yicha agent topadi (skanerlar dublikat qo'shmasin). */
  findByFile(filePath) {
    for (const a of this.agents.values()) {
      if (a.filePath === filePath) return a;
    }
    return void 0;
  }
  /** Sessiya ID bo'yicha agent topadi (hook yo'naltirish). */
  findBySession(sessionId) {
    for (const a of this.agents.values()) {
      if (a.sessionId === sessionId) return a;
    }
    return void 0;
  }
  /** Broadcast'larni vaqtincha o'chiradi (tarixni jimgina qayta o'qish uchun).
   *  begin/end juftlik sinxron blokda ishlatilishi shart. */
  beginSilent() {
    this.silent++;
  }
  endSilent() {
    if (this.silent > 0) this.silent--;
  }
  /** Webview'ga faoliyat xabarini uzatadi (silent rejimda o'tkazib yuboriladi). */
  broadcast(msg) {
    if (this.silent > 0) return;
    this.emit("broadcast", msg);
  }
  disposeAll() {
    for (const a of this.agents.values()) {
      if (a.waitingTimer) clearTimeout(a.waitingTimer);
      if (a.permissionTimer) clearTimeout(a.permissionTimer);
    }
    this.agents.clear();
  }
};

// extension/server/fileWatcher.ts
var fs2 = __toESM(require("node:fs"));
var import_node_string_decoder = require("node:string_decoder");

// extension/core/changedFiles.ts
var WRITE_TOOLS = /* @__PURE__ */ new Set(["Edit", "MultiEdit", "Write", "NotebookEdit"]);
function dayKey(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function noteFileTool(files, tool, input, ts) {
  if (!WRITE_TOOLS.has(tool) || !input || typeof input !== "object") return false;
  const inp = input;
  const raw = typeof inp.file_path === "string" ? inp.file_path : typeof inp.notebook_path === "string" ? inp.notebook_path : "";
  if (!raw.trim()) return false;
  const key = raw.replace(/\\/g, "/").toLowerCase();
  const cur = files.get(key);
  if (cur) {
    cur.count += 1;
    cur.lastTs = Math.max(cur.lastTs, ts);
  } else {
    files.set(key, { path: raw, count: 1, lastTs: ts });
  }
  return true;
}
function todaysFiles(files, now, max = 200) {
  const today = dayKey(now);
  return [...files.values()].filter((f) => dayKey(f.lastTs) === today).sort((a, b) => b.lastTs - a.lastTs).slice(0, max);
}

// extension/server/stateActions.ts
function filesMessage(a) {
  return { type: "agentFiles", id: a.id, files: a.files ? todaysFiles(a.files, Date.now()) : [] };
}
function progressMessage(a) {
  const s = a.progressState;
  return { type: "agentProgress", id: a.id, progress: s?.progress ?? null, plan: s?.plan ?? null, startedAt: s?.startedAt ?? null };
}
function agentSnapshotMessages(a) {
  const msgs = [
    { type: "agentStatus", id: a.id, status: a.isWaiting ? "waiting" : "active" }
  ];
  if (a.progressState?.progress || a.progressState?.plan) msgs.push(progressMessage(a));
  if (a.team && a.team.length > 0) msgs.push({ type: "agentTeam", id: a.id, members: a.team });
  if (a.files && a.files.size > 0) msgs.push(filesMessage(a));
  if (a.inputTokens > 0 || a.outputTokens > 0) {
    msgs.push({
      type: "agentTokenUsage",
      id: a.id,
      inputTokens: a.inputTokens,
      outputTokens: a.outputTokens,
      contextWindow: a.contextWindow,
      model: a.model,
      billedInput: a.billedInput,
      billedCacheWrite: a.billedCacheWrite,
      billedCacheRead: a.billedCacheRead
    });
  }
  if (!a.isWaiting && a.currentToolLabel && a.activeToolIds.size > 0) {
    for (const tid of a.activeToolIds) {
      msgs.push({ type: "agentToolStart", id: a.id, toolId: tid, status: a.currentToolLabel, toolName: a.currentToolName });
    }
  }
  for (const [tid, info] of a.subagentToolIds) {
    msgs.push({ type: "subagentToolStart", id: a.id, parentToolId: tid, toolId: tid, status: "Task", label: info.label, kind: info.kind });
  }
  if (a.customName) msgs.push({ type: "agentRenamed", id: a.id, name: a.customName });
  if (a.permissionActive) msgs.push({ type: "agentToolPermission", id: a.id });
  if (a.blocked) msgs.push({ type: "agentBlocked", id: a.id, blocked: true, reason: a.blockedReason });
  if (a.permissionMode && a.permissionMode !== "default") msgs.push({ type: "agentPermissionMode", id: a.id, mode: a.permissionMode });
  if (a.snapToolCalls !== void 0) {
    msgs.push({ type: "agentSessionStats", id: a.id, toolCalls: a.snapToolCalls, turns: a.snapTurns ?? 0, activeMs: a.snapActiveMs ?? 0 });
  }
  if (Object.keys(a.toolCats).length > 0) {
    msgs.push({ type: "agentToolCats", id: a.id, toolCats: a.toolCats });
  }
  return msgs;
}
function permissionDelayFor(name, mode) {
  if (mode !== "default") return null;
  if (PERMISSION_EXEMPT_TOOLS.has(name)) return null;
  return INSTANT_WRITE_TOOLS.has(name) ? PERMISSION_TIMER_FAST_MS : PERMISSION_TIMER_SLOW_MS;
}
function formatToolStatus(name, input) {
  const i = input || {};
  const p = i.file_path || i.path;
  let target = "";
  if (typeof p === "string" && p) {
    target = " " + (p.split(/[\\/]/).pop() || "").slice(0, 40);
  } else {
    const other = i.command || i.pattern || i.url || "";
    if (typeof other === "string" && other) target = " " + other.replace(/\s+/g, " ").trim().slice(0, 40);
  }
  return (name + target).trim();
}
function formatSubagent(input) {
  const i = input || {};
  const d = i.description;
  const k = i.subagent_type;
  return {
    label: typeof d === "string" ? d.replace(/\s+/g, " ").trim().slice(0, 60) : "",
    kind: typeof k === "string" && k.trim() ? k.trim().slice(0, 32) : void 0
  };
}
var MAX_ERROR_LEN = 180;
function formatError(content) {
  let s = "";
  if (typeof content === "string") {
    s = content;
  } else if (Array.isArray(content)) {
    s = content.map((b) => b && typeof b === "object" && typeof b.text === "string" ? b.text : "").join(" ");
  }
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return "";
  return s.length > MAX_ERROR_LEN ? `${s.slice(0, MAX_ERROR_LEN - 1)}\u2026` : s;
}
function setBlocked(store, agent, on, reason) {
  const r = on ? reason || void 0 : void 0;
  if (agent.blocked === on && agent.blockedReason === r) return;
  agent.blocked = on;
  agent.blockedReason = r;
  store.broadcast({ type: "agentBlocked", id: agent.id, blocked: on, reason: r });
}
function setActive(store, agent) {
  if (agent.waitingTimer) {
    clearTimeout(agent.waitingTimer);
    agent.waitingTimer = void 0;
  }
  if (agent.isWaiting) {
    agent.isWaiting = false;
    store.broadcast({ type: "agentStatus", id: agent.id, status: "active" });
  }
}
function markWaiting(store, agent, awaitingInput) {
  if (agent.waitingTimer) {
    clearTimeout(agent.waitingTimer);
    agent.waitingTimer = void 0;
  }
  if (agent.permissionTimer) {
    clearTimeout(agent.permissionTimer);
    agent.permissionTimer = void 0;
  }
  agent.hadToolsInTurn = false;
  agent.activeToolIds.clear();
  agent.subagentToolIds.clear();
  agent.hookToolQueue.clear();
  agent.currentToolLabel = void 0;
  agent.currentToolName = void 0;
  agent.permissionActive = false;
  agent.isWaiting = true;
  store.broadcast({ type: "agentToolsClear", id: agent.id });
  store.broadcast({ type: "agentStatus", id: agent.id, status: "waiting", awaitingInput });
}

// extension/server/roleInference.ts
var EXT_ROLE = {
  tsx: "frontend",
  jsx: "frontend",
  vue: "frontend",
  svelte: "frontend",
  css: "frontend",
  scss: "frontend",
  sass: "frontend",
  less: "frontend",
  html: "frontend",
  go: "backend",
  py: "backend",
  rs: "backend",
  rb: "backend",
  php: "backend",
  java: "backend",
  kt: "backend",
  cs: "backend",
  sql: "backend",
  md: "docs",
  mdx: "docs",
  rst: "docs",
  adoc: "docs",
  csv: "data",
  ipynb: "data",
  parquet: "data"
};
var WRITE_TOOLS2 = /* @__PURE__ */ new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
function accumulateRole(agent, name, input) {
  const s = agent.roleScores;
  const add = (role, w) => {
    s[role] = (s[role] ?? 0) + w;
  };
  const fpRaw = input && (input.file_path ?? input.path ?? input.notebook_path);
  if (typeof fpRaw === "string" && fpRaw) {
    const fp = fpRaw.toLowerCase();
    const w = WRITE_TOOLS2.has(name) ? 3 : 1;
    if (/\.(test|spec)\.|__tests__|(^|[\\/])tests?[\\/]/.test(fp)) add("qa", w + 1);
    else {
      const ext = fp.includes(".") ? fp.slice(fp.lastIndexOf(".") + 1) : "";
      const role = EXT_ROLE[ext];
      if (role) add(role, w);
    }
  }
  if (name === "Bash") {
    const cmd = input && typeof input.command === "string" ? input.command.toLowerCase() : "";
    if (cmd) {
      if (/\b(jest|vitest|pytest|mocha|rspec|phpunit)\b|\bgo test\b|\bnpm (run )?test\b/.test(cmd)) add("qa", 2);
      else if (/\b(psql|prisma|sqlite3|createdb|migrate|alembic)\b/.test(cmd)) add("backend", 2);
      else if (/\b(jupyter|pandas|dvc)\b/.test(cmd)) add("data", 2);
    }
  }
  if (name === "WebSearch" || name === "WebFetch") add("research", 1);
  let best = null, bestS = 0, second = 0;
  for (const r in s) {
    const v = s[r];
    if (v > bestS) {
      second = bestS;
      bestS = v;
      best = r;
    } else if (v > second) second = v;
  }
  if (best && bestS >= 4 && bestS - second >= 2 && agent.role !== best) {
    agent.role = best;
    return best;
  }
  return null;
}

// extension/core/toolcat.ts
function toolCat(label) {
  const w = (label.split(/\s+/)[0] || "").toLowerCase();
  if (["edit", "write", "multiedit", "notebookedit"].includes(w)) return "edit";
  if (["read", "grep", "glob", "ls", "notebookread"].includes(w)) return "read";
  if (["websearch", "webfetch"].includes(w)) return "research";
  if (w === "bash") {
    return /\b(test|jest|vitest|pytest|go test|npm t|rspec|phpunit|cargo test|mocha)\b/.test(label.toLowerCase()) ? "test" : "run";
  }
  return "other";
}

// extension/core/progress.ts
var PROGRESS_RE = /^[ \t]*(?:[-*]\s+)?(?:\*\*)?\[\s*(\d{1,4})\s*\/\s*(\d{1,4})\s*\|\s*(\d{1,3}(?:\.\d+)?)\s*%\s*\](?:\*\*)?\s*([^\n]*)/gm;
function parseProgress(text, ts) {
  let last = null;
  PROGRESS_RE.lastIndex = 0;
  for (let m = PROGRESS_RE.exec(text); m; m = PROGRESS_RE.exec(text)) last = m;
  if (!last) return null;
  const n = parseInt(last[1], 10);
  const total = parseInt(last[2], 10);
  if (!(total > 0) || n < 0 || n > total) return null;
  const pct = Math.max(0, Math.min(100, parseFloat(last[3])));
  let label = last[4].replace(/[*`_#]/g, "").trim();
  const cut = label.search(/(?<=[.!?。])\s/);
  if (cut > 0) label = label.slice(0, cut);
  if (label.length > 90) label = label.slice(0, 89) + "\u2026";
  if (!/[\p{L}\p{N}]/u.test(label)) label = "";
  return { n, total, pct, label, ts };
}
function parseNumberedList(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let best = null;
  let cur = [];
  const flush = () => {
    if (cur.length >= 2) best = cur;
    cur = [];
  };
  const clean = (raw) => {
    let item = raw.replace(/[*`_]/g, "").trim();
    const colon = item.search(/[:：(]/);
    if (colon > 0) item = item.slice(0, colon).trim();
    return item.length > 60 ? item.slice(0, 59) + "\u2026" : item;
  };
  for (const line of lines) {
    const m = line.match(/^\s{0,3}(\d{1,2})[.)]\s+(.+)$/);
    if (m && parseInt(m[1], 10) === cur.length + 1) {
      cur.push(clean(m[2]));
    } else if (m && parseInt(m[1], 10) === 1) {
      flush();
      cur.push(clean(m[2]));
    } else if (line.trim() === "" || /^\s{2,}\S/.test(line)) {
    } else {
      flush();
    }
  }
  flush();
  return best;
}
var emptyProgress = () => ({ progress: null, plan: null, candidate: null, startedAt: null });
function applyAssistantText(s, text, ts) {
  let changed = false;
  const list = parseNumberedList(text);
  if (list) s.candidate = list;
  const p = parseProgress(text, ts);
  if (p) {
    const prev = s.progress;
    if (s.startedAt == null || !prev || prev.n === prev.total && p.n < p.total || p.total !== prev.total || p.n < prev.n) {
      s.startedAt = ts;
    }
    s.progress = p;
    if (s.candidate && s.candidate.length === p.total) s.plan = s.candidate;
    else if (s.plan && s.plan.length !== p.total) s.plan = null;
    changed = true;
  } else if (list && s.progress == null && s.startedAt == null) {
  }
  return changed;
}
function applyUserText(s, wasIdle) {
  if (!s.progress && !s.plan) {
    s.candidate = null;
    return false;
  }
  const finished = s.progress != null && s.progress.n >= s.progress.total;
  if (!finished && !wasIdle) return false;
  Object.assign(s, emptyProgress());
  return true;
}

// extension/server/types.ts
var CHAT_BUFFER_MAX = 400;
function createAgentState(id, filePath, folderName, opts = {}) {
  return {
    id,
    filePath,
    sessionId: opts.sessionId,
    fileOffset: 0,
    lineBuffer: "",
    folderName,
    role: opts.role,
    roleScores: {},
    toolCats: {},
    task: opts.task,
    isExternal: opts.isExternal ?? false,
    hadToolsInTurn: false,
    isWaiting: true,
    activeToolIds: /* @__PURE__ */ new Set(),
    subagentToolIds: /* @__PURE__ */ new Map(),
    permissionActive: false,
    blocked: false,
    permissionMode: "default",
    // mode satri ko'rilguncha konservativ (heuristik yoqiq)
    hookDelivered: false,
    hookToolQueue: /* @__PURE__ */ new Map(),
    hookToolCounter: 0,
    inputTokens: 0,
    outputTokens: 0,
    billedInput: 0,
    billedCacheWrite: 0,
    billedCacheRead: 0,
    contextWindow: MAX_CONTEXT_TOKENS,
    chat: []
  };
}

// extension/server/transcriptParser.ts
function startWaitingTimer(store, agent) {
  if (agent.waitingTimer) clearTimeout(agent.waitingTimer);
  agent.waitingTimer = setTimeout(() => {
    agent.waitingTimer = void 0;
    markWaiting(store, agent, false);
  }, TEXT_IDLE_DELAY_MS);
}
function startPermissionTimer(store, agent, delayMs) {
  if (agent.permissionTimer) clearTimeout(agent.permissionTimer);
  agent.permissionTimer = setTimeout(() => {
    agent.permissionTimer = void 0;
    agent.permissionActive = true;
    store.broadcast({ type: "agentToolPermission", id: agent.id });
  }, delayMs);
}
function clearPermission(store, agent) {
  if (agent.permissionTimer) {
    clearTimeout(agent.permissionTimer);
    agent.permissionTimer = void 0;
  }
  if (agent.permissionActive) {
    agent.permissionActive = false;
    store.broadcast({ type: "agentToolPermissionClear", id: agent.id });
  }
}
function emitTokens(store, agent, message) {
  const model = message.model;
  if (model && model !== agent.model && model !== "<synthetic>") {
    agent.model = model;
    agent.contextWindow = Math.max(agent.contextWindow, contextWindowForModel(model));
  }
  const usage = message.usage;
  if (!usage) return;
  const ctx = (usage.input_tokens || 0) + (usage.cache_read_input_tokens || 0) + (usage.cache_creation_input_tokens || 0);
  if (ctx > 0) agent.inputTokens = ctx;
  if (ctx > MAX_CONTEXT_TOKENS && agent.contextWindow < CONTEXT_WINDOW_1M) {
    agent.contextWindow = CONTEXT_WINDOW_1M;
  }
  agent.outputTokens += usage.output_tokens || 0;
  agent.billedInput += usage.input_tokens || 0;
  agent.billedCacheWrite += usage.cache_creation_input_tokens || 0;
  agent.billedCacheRead += usage.cache_read_input_tokens || 0;
  store.broadcast({
    type: "agentTokenUsage",
    id: agent.id,
    inputTokens: agent.inputTokens,
    outputTokens: agent.outputTokens,
    contextWindow: agent.contextWindow,
    model: agent.model,
    billedInput: agent.billedInput,
    billedCacheWrite: agent.billedCacheWrite,
    billedCacheRead: agent.billedCacheRead
  });
}
var CHAT_TEXT_MAX = 4e3;
function lineTimestamp(o) {
  const t = o.timestamp;
  if (typeof t === "string") {
    const ms = Date.parse(t);
    if (!Number.isNaN(ms)) return ms;
  }
  return Date.now();
}
function pushChat(store, agent, role, text, ts) {
  const trimmed = text.replace(/\s+$/, "");
  if (!trimmed) return;
  const entry = { role, text: trimmed.slice(0, CHAT_TEXT_MAX), ts };
  agent.chat.push(entry);
  if (agent.chat.length > CHAT_BUFFER_MAX) agent.chat.splice(0, agent.chat.length - CHAT_BUFFER_MAX);
  store.broadcast({ type: "agentSpeech", id: agent.id, role, text: entry.text, ts });
  if (role === "assistant" || role === "thinking" || role === "user") {
    const ps = agent.progressState ??= emptyProgress();
    const changed = role === "user" ? applyUserText(ps, agent.isWaiting) : applyAssistantText(ps, trimmed, ts);
    if (changed) store.broadcast(progressMessage(agent));
  }
}
function extractChat(store, agent, o) {
  const type = o.type;
  const message = o.message;
  if (!message) return;
  const ts = lineTimestamp(o);
  if (type === "assistant" && Array.isArray(message.content)) {
    for (const b of message.content) {
      if (!b) continue;
      if (b.type === "text" && typeof b.text === "string") pushChat(store, agent, "assistant", b.text, ts);
      else if (b.type === "thinking" && typeof b.thinking === "string") pushChat(store, agent, "thinking", b.thinking, ts);
    }
    return;
  }
  if (type === "user") {
    const content = message.content;
    if (typeof content === "string") {
      if (content && !content.startsWith("<")) pushChat(store, agent, "user", content, ts);
      return;
    }
    if (Array.isArray(content)) {
      for (const b of content) {
        if (b && b.type === "text" && typeof b.text === "string" && b.text && !b.text.startsWith("<")) {
          pushChat(store, agent, "user", b.text, ts);
        }
      }
    }
  }
}
function processTranscriptLine(store, agent, line) {
  if (!line.trim()) return;
  let o;
  try {
    o = JSON.parse(line);
  } catch {
    return;
  }
  if (!o || typeof o !== "object" || Array.isArray(o)) return;
  const type = o.type;
  const message = o.message;
  extractChat(store, agent, o);
  if (typeof o.permissionMode === "string") {
    if (agent.permissionMode !== o.permissionMode) {
      agent.permissionMode = o.permissionMode;
      store.broadcast({ type: "agentPermissionMode", id: agent.id, mode: agent.permissionMode });
    }
    if (agent.permissionMode !== "default") clearPermission(store, agent);
  }
  if (agent.hookDelivered) {
    if (type === "assistant" && message) emitTokens(store, agent, message);
    return;
  }
  if (type === "system" && o.subtype === "turn_duration") {
    markWaiting(store, agent, false);
    return;
  }
  if (type === "system" && o.subtype === "api_error") {
    setBlocked(store, agent, true);
    return;
  }
  if (type === "assistant" && message && Array.isArray(message.content)) {
    const blocks = message.content;
    const toolUses = blocks.filter((b) => b && b.type === "tool_use");
    if (toolUses.length > 0) {
      const files = agent.files ??= /* @__PURE__ */ new Map();
      const at = lineTimestamp(o);
      let touched = false;
      for (const b of toolUses) touched = noteFileTool(files, String(b.name ?? ""), b.input, at) || touched;
      if (touched) store.broadcast(filesMessage(agent));
    }
    const hasText = blocks.some((b) => b && b.type === "text");
    const hasThinking = blocks.some((b) => b && (b.type === "thinking" || b.type === "redacted_thinking"));
    emitTokens(store, agent, message);
    if (toolUses.length > 0) {
      setActive(store, agent);
      agent.hadToolsInTurn = true;
      for (const tool of toolUses) {
        const toolId = tool.id || `t-${agent.id}-${agent.activeToolIds.size}`;
        const name = tool.name || "Tool";
        const status = formatToolStatus(name, tool.input);
        const runInBackground = !!(tool.input && tool.input.run_in_background);
        if (!agent.roleManual) {
          const detected = accumulateRole(agent, name, tool.input);
          if (detected) store.broadcast({ type: "agentRoleDetected", id: agent.id, role: detected });
        }
        if (SUBAGENT_TOOL_NAMES.has(name)) {
          const info = formatSubagent(tool.input);
          agent.subagentToolIds.set(toolId, info);
          store.broadcast({
            type: "subagentToolStart",
            id: agent.id,
            parentToolId: toolId,
            toolId,
            status,
            label: info.label,
            kind: info.kind
          });
        } else {
          agent.activeToolIds.add(toolId);
          agent.currentToolLabel = status;
          agent.currentToolName = name;
          agent.toolCats[toolCat(status)] = (agent.toolCats[toolCat(status)] ?? 0) + 1;
          store.broadcast({
            type: "agentToolStart",
            id: agent.id,
            toolId,
            status,
            toolName: name,
            runInBackground
          });
          const delay = permissionDelayFor(name, agent.permissionMode);
          if (delay != null) startPermissionTimer(store, agent, delay);
        }
      }
      return;
    }
    if (hasThinking) {
      setActive(store, agent);
    }
    if (hasText) {
      setActive(store, agent);
      if (!agent.hadToolsInTurn) startWaitingTimer(store, agent);
    }
    return;
  }
  if (type === "user" && message) {
    const content = message.content;
    if (Array.isArray(content)) {
      const toolResults = content.filter(
        (b) => b && b.type === "tool_result"
      );
      if (toolResults.length > 0) {
        clearPermission(store, agent);
        const failed = toolResults.find((tr) => tr.is_error === true);
        setBlocked(store, agent, !!failed, failed ? formatError(failed.content) : void 0);
        for (const tr of toolResults) {
          const toolId = tr.tool_use_id || "";
          if (agent.subagentToolIds.has(toolId)) {
            agent.subagentToolIds.delete(toolId);
            store.broadcast({ type: "subagentClear", id: agent.id, parentToolId: toolId });
          } else if (agent.activeToolIds.has(toolId)) {
            agent.activeToolIds.delete(toolId);
            setTimeout(() => {
              store.broadcast({ type: "agentToolDone", id: agent.id, toolId });
            }, TOOL_DONE_DELAY_MS);
          }
        }
        return;
      }
      const hasText = content.some((b) => b && b.type === "text");
      if (hasText) {
        setActive(store, agent);
        setBlocked(store, agent, false);
        agent.hadToolsInTurn = false;
      }
      return;
    }
    if (typeof content === "string" && content && !content.startsWith("<")) {
      setActive(store, agent);
      setBlocked(store, agent, false);
      agent.hadToolsInTurn = false;
    }
    return;
  }
}
function extractFirstTask(headText) {
  for (const line of headText.split("\n")) {
    if (!line) continue;
    try {
      const o = JSON.parse(line);
      if (o.type === "user" && o.message) {
        const c = o.message.content;
        const s = typeof c === "string" ? c : Array.isArray(c) ? c.find((b) => b.type === "text")?.text || "" : "";
        if (s && !s.startsWith("<")) return s.replace(/\s+/g, " ").slice(0, 60);
      }
    } catch {
    }
  }
  return "\uD074\uB85C\uB4DC \uCF54\uB4DC \uC138\uC158";
}

// extension/server/fileWatcher.ts
var FileWatcher = class {
  constructor(store) {
    this.store = store;
  }
  store;
  timer;
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), FILE_WATCHER_POLL_INTERVAL_MS);
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = void 0;
  }
  /** Yangi agent adopt qilinganda mavjud TARIXni JIMGINA (broadcast'siz) o'qib
   *  holatni tiklaymiz — butun tarix webview'ga flood bo'lmasin. Yakuniy holat
   *  keyin emitSnapshot() orqali BIR marta yuboriladi. Sinxron — tick oraliqda
   *  tushmaydi. */
  primeFromStart(agent) {
    agent.fileOffset = 0;
    agent.lineBuffer = "";
    agent.lineDecoder = void 0;
    agent.inputTokens = 0;
    agent.outputTokens = 0;
    agent.billedInput = 0;
    agent.billedCacheWrite = 0;
    agent.billedCacheRead = 0;
    agent.toolCats = {};
    this.store.beginSilent();
    try {
      let guard = 0;
      while (this.readNewLines(agent) && guard++ < 2e5) {
      }
    } finally {
      this.store.endSilent();
    }
  }
  /** Agentning JORIY holatini webview'ga yuboradi (adopt/rebind'dan keyin).
   *  Avval eski indikatorlarni tozalab, so'ng snapshot qo'llaymiz. */
  emitSnapshot(agent) {
    this.store.broadcast({ type: "agentToolsClear", id: agent.id });
    for (const msg of agentSnapshotMessages(agent)) this.store.broadcast(msg);
  }
  tick() {
    for (const agent of this.store.values()) {
      this.readNewLines(agent);
    }
  }
  /** Bir chunk (MAX_READ_BYTES) yangi baytlarni o'qiydi. Yana o'qish mumkin
   *  bo'lsa (fayl offset'dan katta) true qaytaradi (drain sikli uchun). */
  readNewLines(agent) {
    let stat;
    try {
      stat = fs2.statSync(agent.filePath);
    } catch {
      return false;
    }
    if (stat.size <= agent.fileOffset) {
      if (stat.size < agent.fileOffset) {
        this.primeFromStart(agent);
        this.emitSnapshot(agent);
      }
      return false;
    }
    const toRead = Math.min(stat.size - agent.fileOffset, MAX_READ_BYTES);
    const buf = Buffer.alloc(toRead);
    let bytesRead = 0;
    let fd;
    try {
      fd = fs2.openSync(agent.filePath, "r");
      bytesRead = fs2.readSync(fd, buf, 0, toRead, agent.fileOffset);
    } catch {
      return false;
    } finally {
      if (fd !== void 0) {
        try {
          fs2.closeSync(fd);
        } catch {
        }
      }
    }
    if (bytesRead <= 0) return false;
    agent.fileOffset += bytesRead;
    if (!agent.lineDecoder) agent.lineDecoder = new import_node_string_decoder.StringDecoder("utf8");
    const chunk = agent.lineDecoder.write(bytesRead < buf.length ? buf.subarray(0, bytesRead) : buf);
    const text = agent.lineBuffer + chunk;
    const lines = text.split("\n");
    agent.lineBuffer = lines.pop() ?? "";
    if (agent.lineBuffer.length > MAX_LINE_CHARS) agent.lineBuffer = "";
    for (const line of lines) {
      processTranscriptLine(this.store, agent, line);
    }
    return agent.fileOffset < stat.size;
  }
};

// extension/vscode/gitInfo.ts
var fs3 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var vscode2 = __toESM(require("vscode"));
var cachedApi;
function gitApi() {
  if (cachedApi !== void 0) return cachedApi;
  try {
    const ext = vscode2.extensions.getExtension("vscode.git");
    cachedApi = ext?.exports?.getAPI ? ext.exports.getAPI(1) : null;
  } catch {
    cachedApi = null;
  }
  return cachedApi;
}
function readGitBranch(fsPath) {
  try {
    let dir = fsPath;
    for (let i = 0; i < 10; i++) {
      const head = path2.join(dir, ".git", "HEAD");
      if (fs3.existsSync(head)) {
        const t = fs3.readFileSync(head, "utf8").trim();
        const m = t.match(/ref:\s*refs\/heads\/(.+)$/);
        return m ? m[1] : t.slice(0, 7);
      }
      const parent = path2.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {
  }
  return void 0;
}
var norm = (p) => p.replace(/[\\/]+$/, "").toLowerCase();
function gitInfoForPath(fsPath) {
  const api = gitApi();
  if (api) {
    let best;
    const target = norm(fsPath);
    for (const r of api.repositories) {
      const root = norm(r.rootUri.fsPath);
      if (target === root || target.startsWith(root + "/") || target.startsWith(root + "\\")) {
        if (!best || root.length > norm(best.rootUri.fsPath).length) best = r;
      }
    }
    if (best) {
      const staged = best.state.indexChanges?.length ?? 0;
      const unstaged = best.state.workingTreeChanges?.length ?? 0;
      const head = best.state.HEAD;
      return {
        branch: head?.name,
        changed: staged + unstaged,
        staged,
        unstaged,
        ahead: head?.ahead,
        behind: head?.behind
      };
    }
  }
  const branch = readGitBranch(fsPath);
  return branch ? { branch, changed: 0 } : void 0;
}

// extension/server/hookHandler.ts
function stableStringify(v) {
  try {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = v;
      return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + stableStringify(o[k])).join(",") + "}";
    }
    return JSON.stringify(v) ?? "null";
  } catch {
    return "";
  }
}
var SIG_SEP = String.fromCharCode(31);
function toolSig(name, input) {
  return name + SIG_SEP + stableStringify(input);
}
function popHookTool(agent, name, input) {
  const sig = toolSig(name, input);
  const q = agent.hookToolQueue.get(sig);
  if (q && q.length) {
    const id = q.shift();
    if (!q.length) agent.hookToolQueue.delete(sig);
    return id;
  }
  for (const [k, list] of agent.hookToolQueue) {
    if (list.length) {
      const id = list.shift();
      if (!list.length) agent.hookToolQueue.delete(k);
      return id;
    }
  }
  return void 0;
}
function handleHookEvent(store, agent, raw) {
  if (!agent.hookDelivered) {
    agent.hookDelivered = true;
    if (agent.activeToolIds.size > 0 || agent.subagentToolIds.size > 0) {
      agent.activeToolIds.clear();
      agent.subagentToolIds.clear();
      agent.hookToolQueue.clear();
      agent.currentToolLabel = void 0;
      agent.currentToolName = void 0;
      store.broadcast({ type: "agentToolsClear", id: agent.id });
    }
    if (agent.permissionTimer) {
      clearTimeout(agent.permissionTimer);
      agent.permissionTimer = void 0;
    }
    if (agent.waitingTimer) {
      clearTimeout(agent.waitingTimer);
      agent.waitingTimer = void 0;
    }
    if (agent.permissionActive) {
      agent.permissionActive = false;
      store.broadcast({ type: "agentToolPermissionClear", id: agent.id });
    }
  }
  const event = raw.hook_event_name;
  switch (event) {
    case "PreToolUse": {
      setActive(store, agent);
      const name = raw.tool_name || "Tool";
      const input = raw.tool_input;
      const runInBackground = !!(input && input.run_in_background);
      const status = formatToolStatus(name, input);
      if (!agent.roleManual) {
        const detected = accumulateRole(agent, name, input);
        if (detected) store.broadcast({ type: "agentRoleDetected", id: agent.id, role: detected });
      }
      const sig = toolSig(name, input);
      const isSub = SUBAGENT_TOOL_NAMES.has(name);
      const toolId = `${isSub ? "hook-sub" : "hook"}-${agent.hookToolCounter++}`;
      const q = agent.hookToolQueue.get(sig);
      if (q) q.push(toolId);
      else agent.hookToolQueue.set(sig, [toolId]);
      if (isSub) {
        const info = formatSubagent(input);
        agent.subagentToolIds.set(toolId, info);
        store.broadcast({ type: "subagentToolStart", id: agent.id, parentToolId: toolId, toolId, status, label: info.label, kind: info.kind });
      } else {
        agent.activeToolIds.add(toolId);
        agent.currentToolLabel = status;
        agent.currentToolName = name;
        agent.toolCats[toolCat(status)] = (agent.toolCats[toolCat(status)] ?? 0) + 1;
        store.broadcast({ type: "agentToolStart", id: agent.id, toolId, status, toolName: name, runInBackground });
      }
      break;
    }
    case "PostToolUse":
    case "PostToolUseFailure": {
      const failed = event === "PostToolUseFailure";
      setBlocked(store, agent, failed, failed ? formatError(raw.tool_response ?? raw.error) : void 0);
      if (agent.permissionActive) {
        agent.permissionActive = false;
        store.broadcast({ type: "agentToolPermissionClear", id: agent.id });
      }
      const name = raw.tool_name || "Tool";
      const toolId = popHookTool(agent, name, raw.tool_input);
      if (toolId) {
        if (agent.subagentToolIds.has(toolId)) {
          agent.subagentToolIds.delete(toolId);
          store.broadcast({ type: "subagentClear", id: agent.id, parentToolId: toolId });
        } else {
          agent.activeToolIds.delete(toolId);
          store.broadcast({ type: "agentToolDone", id: agent.id, toolId });
          if (agent.activeToolIds.size === 0) {
            agent.currentToolLabel = void 0;
            agent.currentToolName = void 0;
          }
        }
      }
      break;
    }
    case "Stop":
      markWaiting(store, agent, false);
      break;
    case "Notification": {
      const msg = (raw.message || "").toLowerCase();
      if (/permission|approve|allow|grant|confirm/.test(msg)) {
        agent.permissionActive = true;
        store.broadcast({ type: "agentToolPermission", id: agent.id });
      } else if (/waiting|input|idle/.test(msg)) {
        markWaiting(store, agent, true);
      }
      break;
    }
    case "UserPromptSubmit":
      setActive(store, agent);
      setBlocked(store, agent, false);
      break;
    case "SubagentStop": {
      for (const tid of [...agent.subagentToolIds.keys()]) {
        agent.subagentToolIds.delete(tid);
        store.broadcast({ type: "subagentClear", id: agent.id, parentToolId: tid });
      }
      break;
    }
    // SessionStart / SessionEnd — hayot-tsikli ViewProvider'da (agent yaratish/o'chirish)
    default:
      break;
  }
}

// extension/server/hookServer.ts
var crypto = __toESM(require("node:crypto"));
var fs4 = __toESM(require("node:fs"));
var http = __toESM(require("node:http"));
var os2 = __toESM(require("node:os"));
var path3 = __toESM(require("node:path"));
var MAX_BODY = 256 * 1024;
var HookServer = class {
  /** `folders` — shu oyna kuzatayotgan ish-papkalar (yo'naltirish uchun). */
  constructor(onEvent, folders = () => []) {
    this.onEvent = onEvent;
    this.folders = folders;
  }
  onEvent;
  folders;
  server;
  token = crypto.randomBytes(24).toString("hex");
  port = 0;
  /** v4: 마지막 훅 수신 시각(ms). 0 이면 아직 없음. */
  lastEventAt = 0;
  get portNumber() {
    return this.port;
  }
  async start() {
    this.pruneDead();
    return new Promise((resolve2) => {
      const server = http.createServer((req, res) => this.handle(req, res));
      server.on("error", () => resolve2(null));
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address();
        this.port = typeof addr === "object" && addr ? addr.port : 0;
        this.server = server;
        this.writeEntry();
        resolve2({ port: this.port, token: this.token });
      });
    });
  }
  /** Ish-papkalar o'zgarganда (onDidChangeWorkspaceFolders) yozuvni yangilaydi. */
  refreshFolders() {
    if (this.server) this.writeEntry();
  }
  isAlive(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch (e) {
      return e.code === "EPERM";
    }
  }
  handle(req, res) {
    if (req.method === "GET" && req.url === "/api/health") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
      return;
    }
    if (req.method !== "POST" || !req.url || !req.url.startsWith("/api/hooks/")) {
      res.writeHead(404);
      res.end();
      return;
    }
    if (req.headers["authorization"] !== `Bearer ${this.token}`) {
      res.writeHead(401);
      res.end();
      return;
    }
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > MAX_BODY) req.destroy();
    });
    req.on("end", () => {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
      try {
        const raw = JSON.parse(body);
        const sessionId = raw.session_id;
        if (typeof sessionId === "string" && raw.hook_event_name) {
          this.lastEventAt = Date.now();
          this.onEvent(sessionId, raw);
        }
      } catch {
      }
    });
  }
  aoDir() {
    return path3.join(os2.homedir(), ".agent-office");
  }
  serversDir() {
    return path3.join(this.aoDir(), "servers");
  }
  ownFile() {
    return path3.join(this.serversDir(), `${process.pid}.json`);
  }
  serverJsonPath() {
    return path3.join(this.aoDir(), "server.json");
  }
  atomicWrite(file, content) {
    try {
      fs4.mkdirSync(path3.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      fs4.writeFileSync(tmp, content);
      fs4.renameSync(tmp, file);
    } catch {
    }
  }
  writeEntry() {
    const folders = this.folders().filter((f) => typeof f === "string" && f.length > 0);
    this.atomicWrite(this.ownFile(), JSON.stringify({ port: this.port, pid: process.pid, token: this.token, folders }));
    this.atomicWrite(this.serverJsonPath(), JSON.stringify({ port: this.port, pid: process.pid, token: this.token }));
  }
  /** O'lik oynalarning servers/<pid>.json yozuvlarini olib tashlaydi. */
  pruneDead() {
    let names;
    try {
      names = fs4.readdirSync(this.serversDir());
    } catch {
      return;
    }
    for (const name of names) {
      if (!name.endsWith(".json")) continue;
      const file = path3.join(this.serversDir(), name);
      try {
        const e = JSON.parse(fs4.readFileSync(file, "utf8"));
        if (typeof e.pid === "number" && e.pid !== process.pid && !this.isAlive(e.pid)) {
          fs4.rmSync(file, { force: true });
        }
      } catch {
      }
    }
  }
  stop() {
    try {
      this.server?.close();
    } catch {
    }
    try {
      fs4.rmSync(this.ownFile(), { force: true });
    } catch {
    }
    try {
      const cur = JSON.parse(fs4.readFileSync(this.serverJsonPath(), "utf8"));
      if (cur.pid === process.pid) fs4.rmSync(this.serverJsonPath(), { force: true });
    } catch {
    }
  }
};

// extension/vscode/agentManager.ts
var crypto2 = __toESM(require("node:crypto"));
var fs6 = __toESM(require("node:fs"));
var os4 = __toESM(require("node:os"));
var path5 = __toESM(require("node:path"));
var vscode3 = __toESM(require("vscode"));

// extension/core/paths.ts
var fs5 = __toESM(require("node:fs"));
var os3 = __toESM(require("node:os"));
var path4 = __toESM(require("node:path"));
function claudeProjectsRoot() {
  return path4.join(os3.homedir(), ".claude", "projects");
}
function normalizeProjectPath(absPath) {
  return absPath.replace(/[^a-zA-Z0-9-]/g, "-");
}
function getSessionDir(workspacePath) {
  const root = claudeProjectsRoot();
  const dirName = normalizeProjectPath(workspacePath);
  const exact = path4.join(root, dirName);
  if (fs5.existsSync(exact)) return exact;
  try {
    const match = fs5.readdirSync(root).find((c) => c.toLowerCase() === dirName.toLowerCase());
    if (match) return path4.join(root, match);
  } catch {
  }
  return exact;
}

// extension/vscode/agentManager.ts
var HEAD_BYTES = 8192;
var AgentManager = class {
  constructor(store, watcher, log = () => {
  }) {
    this.store = store;
    this.watcher = watcher;
    this.log = log;
  }
  store;
  watcher;
  log;
  terminals = /* @__PURE__ */ new Map();
  scanTimer;
  disposables = [];
  pendingTimers = /* @__PURE__ */ new Set();
  // dispose'da tozalanadi
  terminalCounter = 0;
  startupTime = 0;
  /** /clear yoki /resume'dan keyin tashlab ketilgan eski transcript fayllari —
   *  scanForNew ularni qayta adopt qilmasin (aks holda zombi qayta paydo bo'ladi). */
  retired = /* @__PURE__ */ new Set();
  /** Skan ustma-ust ketmasin — async statlar oldingi skan tugamasdan yangisi boshlanmasin. */
  scanning = false;
  start() {
    this.disposables.push(
      vscode3.window.onDidCloseTerminal((term) => {
        for (const [id, t] of this.terminals) {
          if (t === term) {
            this.detach(id);
            return;
          }
        }
        const cwd = this.terminalCwd(term);
        if (!cwd) return;
        for (const a of this.store.values()) {
          if (a.isExternal && !this.terminals.has(a.id)) {
            const ws = this.wsForAgent(a);
            if (ws && this.samePath(cwd, ws)) {
              this.detach(a.id);
              return;
            }
          }
        }
      })
    );
    this.startupTime = Date.now();
    this.scanTimer = setInterval(() => void this.scanForNew(), PROJECT_SCAN_INTERVAL_MS);
  }
  workspaceFolders() {
    return (vscode3.workspace.workspaceFolders ?? []).map((f) => f.uri.fsPath);
  }
  folderNameOf(wsPath) {
    return path5.basename(wsPath);
  }
  sessionDirs() {
    return this.workspaceFolders().map((ws) => ({
      dir: getSessionDir(ws),
      folderName: this.folderNameOf(ws)
    }));
  }
  // ── Terminal ↔ agent bog'lash (cwd bo'yicha, ishonchli) ──────
  /** Terminalning ish papkasi — shell-integration yoki yaratilish opsiyasidan. */
  terminalCwd(t) {
    const si = t.shellIntegration;
    if (si?.cwd) return si.cwd.fsPath;
    const c = t.creationOptions?.cwd;
    if (typeof c === "string") return c;
    if (c && typeof c.fsPath === "string") return c.fsPath;
    return void 0;
  }
  samePath(a, b) {
    const norm2 = (p) => path5.resolve(p).replace(/[\\/]+$/, "");
    const na = norm2(a);
    const nb = norm2(b);
    return process.platform === "win32" ? na.toLowerCase() === nb.toLowerCase() : na === nb;
  }
  /** Agent qaysi ish papkasiga tegishli (sessiya papkasidan teskari topamiz). */
  wsForAgent(agent) {
    const dir = path5.dirname(agent.filePath);
    return this.workspaceFolders().find((ws) => this.samePath(getSessionDir(ws), dir));
  }
  /** Agentni cwd mos keladigan, band bo'lmagan terminalga bog'laydi. */
  bindByCwd(agent) {
    if (this.terminals.has(agent.id)) return true;
    const ws = this.wsForAgent(agent);
    if (!ws) return false;
    const bound = new Set(this.terminals.values());
    const matches = (t) => {
      const cwd = this.terminalCwd(t);
      return !!cwd && this.samePath(cwd, ws);
    };
    const active = vscode3.window.activeTerminal;
    if (active && !bound.has(active) && matches(active)) {
      this.terminals.set(agent.id, active);
      return true;
    }
    for (const t of vscode3.window.terminals) {
      if (!bound.has(t) && matches(t)) {
        this.terminals.set(agent.id, t);
        return true;
      }
    }
    return false;
  }
  /** Shu loyihada YANGI faoliyatli sessiyani avto-qabul qiladi. ASYNC — I/O
   *  (readdir/stat) extension host asosiy oqimini bloklamaydi. */
  async scanForNew() {
    if (this.scanning) return;
    this.scanning = true;
    try {
      for (const { dir, folderName } of this.sessionDirs()) {
        const ws = this.wsForDir(dir);
        for (const f of await this.listJsonl(dir)) {
          const sid = path5.basename(f.filePath, ".jsonl");
          if (this.store.findByFile(f.filePath) || this.store.findBySession(sid)) continue;
          if (this.retired.has(f.filePath)) continue;
          if (f.mtime < this.startupTime) continue;
          if (this.tryReassignNewFile(dir, ws, f.filePath)) continue;
          this.adopt(f.filePath, folderName, true);
        }
      }
      for (const agent of this.store.values()) {
        if (agent.isExternal && !this.terminals.has(agent.id)) this.bindByCwd(agent);
      }
      const open = new Set(vscode3.window.terminals);
      for (const id of [...this.terminals.keys()]) {
        const t = this.terminals.get(id);
        if (t && !open.has(t)) this.detach(id);
      }
      for (const agent of this.store.values()) {
        if (agent.isExternal && !fs6.existsSync(agent.filePath)) {
          this.store.remove(agent.id);
        }
      }
    } finally {
      this.scanning = false;
    }
  }
  /** Sessiya papkasidagi HALI KUZATILMAGAN `.jsonl` fayllar (yo'l + mtime).
   *  Allaqachon kuzatilayotgan yoki retired fayllarga stat SHART EMAS — mtime ular
   *  uchun ishlatilmaydi, shu bilan har skanда yuzlab keraksiz stat oldini olamiz.
   *  Async + parallel (`Promise.all`) — asosiy oqim bloklanmaydi. */
  async listJsonl(dir) {
    let entries;
    try {
      entries = await fs6.promises.readdir(dir);
    } catch {
      return [];
    }
    const stats = await Promise.all(
      entries.map(async (name) => {
        if (!name.endsWith(".jsonl")) return null;
        const filePath = path5.join(dir, name);
        if (this.retired.has(filePath)) return null;
        if (this.store.findByFile(filePath) || this.store.findBySession(path5.basename(name, ".jsonl"))) return null;
        try {
          const st = await fs6.promises.stat(filePath);
          return st.isFile() ? { filePath, mtime: st.mtimeMs } : null;
        } catch {
          return null;
        }
      })
    );
    return stats.filter((x) => x !== null);
  }
  adopt(filePath, folderName, isExternal, role) {
    const sessionId = path5.basename(filePath, ".jsonl");
    if (this.store.findByFile(filePath) || this.store.findBySession(sessionId)) return null;
    const id = this.store.allocateId();
    const task = this.readFirstTask(filePath);
    const agent = createAgentState(id, filePath, folderName, { role, task, isExternal, sessionId });
    this.watcher.primeFromStart(agent);
    this.store.add(agent);
    this.watcher.emitSnapshot(agent);
    if (isExternal && !this.bindByCwd(agent)) {
      const active = vscode3.window.activeTerminal;
      const bound = new Set(this.terminals.values());
      if (active && !bound.has(active)) {
        const cwd = this.terminalCwd(active);
        const ws = this.wsForAgent(agent);
        if (!cwd || ws && this.samePath(cwd, ws)) this.terminals.set(id, active);
      }
    }
    return agent;
  }
  readFirstTask(filePath) {
    let fd;
    try {
      fd = fs6.openSync(filePath, "r");
      const buf = Buffer.alloc(HEAD_BYTES);
      const n = fs6.readSync(fd, buf, 0, HEAD_BYTES, 0);
      return extractFirstTask(buf.toString("utf8", 0, n));
    } catch {
      return "\uD074\uB85C\uB4DC \uCF54\uB4DC \uC138\uC158";
    } finally {
      if (fd !== void 0) {
        try {
          fs6.closeSync(fd);
        } catch {
        }
      }
    }
  }
  /** Hook sessiyasi uchun agent topadi yoki yaratadi (avto-kashfiyot). */
  ensureSessionAgent(sessionId, cwd) {
    const existing = this.store.findBySession(sessionId);
    if (existing) return existing;
    const base = cwd || this.workspaceFolders()[0] || os4.homedir();
    const filePath = path5.join(getSessionDir(base), `${sessionId}.jsonl`);
    const byFile = this.store.findByFile(filePath);
    if (byFile) {
      byFile.sessionId = sessionId;
      return byFile;
    }
    const agent = this.adopt(filePath, this.folderNameOf(base), true);
    if (agent) agent.sessionId = sessionId;
    return agent ?? this.store.findBySession(sessionId);
  }
  /** `+Agent` — yangi Claude Code terminali + agent (darhol ko'rinadi). */
  launchAgent(opts = {}) {
    const cwd = opts.folderPath || this.workspaceFolders()[0] || os4.homedir();
    const sessionId = crypto2.randomUUID();
    const idx = ++this.terminalCounter;
    const terminal = vscode3.window.createTerminal({ name: `${CLAUDE_TERMINAL_NAME_PREFIX} #${idx}`, cwd });
    terminal.show();
    const args = ["--session-id", sessionId];
    if (opts.bypassPermissions) args.push("--dangerously-skip-permissions");
    terminal.sendText(`claude ${args.join(" ")}`);
    const expectedFile = path5.join(getSessionDir(cwd), `${sessionId}.jsonl`);
    const id = this.store.allocateId();
    const agent = createAgentState(id, expectedFile, this.folderNameOf(cwd), {
      role: opts.role,
      task: "\uC0C8 \uC138\uC158",
      isExternal: false,
      sessionId
    });
    if (opts.bypassPermissions) agent.permissionMode = "bypassPermissions";
    this.watcher.primeFromStart(agent);
    this.store.add(agent);
    this.watcher.emitSnapshot(agent);
    this.terminals.set(id, terminal);
    this.log(`+Agent #${id} terminal ochildi: claude --session-id ${sessionId.slice(0, 8)}\u2026`);
    const timer = setTimeout(() => {
      this.pendingTimers.delete(timer);
      this.checkLaunchStalled(id, expectedFile);
    }, 2e4);
    this.pendingTimers.add(timer);
  }
  /** +Agent'dan 20s o'tdi — transcript hali yo'q. 'claude' PATH'da yo'q yoki
   *  terminalda xato bo'lishi mumkin. Zombi agentni olib tashlaymiz (terminalni
   *  YOPMAYMIZ — foydalanuvchi xatoni ko'rsin). */
  checkLaunchStalled(id, expectedFile) {
    const agent = this.store.get(id);
    if (!agent) return;
    if (agent.filePath !== expectedFile) return;
    if (fs6.existsSync(expectedFile)) return;
    if (agent.inputTokens > 0 || !agent.isWaiting) return;
    this.log(`\u26A0 #${id}: 20s'da transcript topilmadi \u2014 'claude' PATH'da yo'q bo'lishi mumkin (terminaldagi xatoni ko'ring). Agent olib tashlandi.`);
    this.detach(id);
  }
  /** Agentni store'dan olib tashlaydi (terminalni YOPMAYDI). */
  detach(id) {
    this.terminals.delete(id);
    this.store.remove(id);
  }
  /** Webview "Yopish" tugmasi — agentni VA uning terminalini yopadi. */
  closeAgent(id) {
    const term = this.terminals.get(id);
    this.detach(id);
    if (term) {
      try {
        term.dispose();
      } catch {
      }
    }
  }
  removeBySession(sessionId) {
    const a = this.store.findBySession(sessionId);
    if (a) this.detach(a.id);
  }
  /** Agentni yangi sessiyaga qayta biriktiradi (/clear yoki /resume). Eski
   *  faylni "retired"ga qo'shadi — scanForNew uni qayta adopt qilmasin. */
  rebindAgentToSession(a, newSessionId, dir) {
    if (a.filePath) this.retired.add(a.filePath);
    a.sessionId = newSessionId;
    a.filePath = path5.join(dir, `${newSessionId}.jsonl`);
    this.retired.delete(a.filePath);
    a.hookDelivered = false;
    a.isWaiting = true;
    a.activeToolIds.clear();
    a.subagentToolIds.clear();
    a.hookToolQueue.clear();
    a.inputTokens = 0;
    a.outputTokens = 0;
    a.model = void 0;
    a.contextWindow = MAX_CONTEXT_TOKENS;
    a.blocked = false;
    a.permissionActive = false;
    a.currentToolLabel = void 0;
    a.currentToolName = void 0;
    this.watcher.primeFromStart(a);
    this.watcher.emitSnapshot(a);
  }
  /** Shu papkadagi, terminali HALI OCHIQ, boshqa fayldagi agentlar. */
  openBoundAgentsInDir(dir, excludeFile) {
    const open = new Set(vscode3.window.terminals);
    return this.store.values().filter((a) => {
      if (!this.samePath(path5.dirname(a.filePath), dir)) return false;
      if (excludeFile && a.filePath === excludeFile) return false;
      const t = this.terminals.get(a.id);
      return !!t && open.has(t);
    });
  }
  /** JSONL-rejim (hook yo'q): yangi transcript fayl paydo bo'ldi — bu shu
   *  papkadagi agentning /clear yoki /resume'i bo'lishi mumkin. Agar papkada
   *  bog'lanmagan ochiq terminal bo'lmasa (yangi sessiya uchun joy yo'q) —
   *  mavjud agentni yangi faylga qayta biriktiramiz (dublikatsiz). */
  tryReassignNewFile(dir, ws, newFile) {
    const candidates = this.openBoundAgentsInDir(dir, newFile);
    if (candidates.length === 0) return false;
    if (ws) {
      const bound = new Set(this.terminals.values());
      const freeTermInDir = vscode3.window.terminals.some((t) => {
        const cwd = this.terminalCwd(t);
        return !!cwd && this.samePath(cwd, ws) && !bound.has(t);
      });
      if (freeTermInDir) return false;
    }
    const active = vscode3.window.activeTerminal;
    const pick = candidates.find((a) => this.terminals.get(a.id) === active) ?? candidates[0];
    const newSid = path5.basename(newFile, ".jsonl");
    this.rebindAgentToSession(pick, newSid, dir);
    this.log(`\u21BB #${pick.id} /clear|/resume aniqlandi (JSONL) \u2192 session=${newSid.slice(0, 8)}\u2026`);
    return true;
  }
  /** Berilgan sessiya papkasiga mos ish papkasini topadi. */
  wsForDir(dir) {
    return this.workspaceFolders().find((ws) => this.samePath(getSessionDir(ws), dir));
  }
  /** `/clear` yoki `/resume` — o'sha loyihadagi terminal-agentini yangi
   *  sessiyaga qayta biriktiradi (dublikat yaratmaydi). Topsa — qayta
   *  biriktirilgan agentni, aks holda null. */
  reassignForClear(newSessionId, cwd) {
    const dir = getSessionDir(cwd);
    const candidates = this.openBoundAgentsInDir(dir).filter((a2) => a2.sessionId !== newSessionId);
    if (candidates.length === 0) return null;
    let a;
    if (candidates.length === 1) {
      a = candidates[0];
    } else {
      const active = vscode3.window.activeTerminal;
      a = candidates.find((x) => this.terminals.get(x.id) === active);
      if (!a) return null;
    }
    this.rebindAgentToSession(a, newSessionId, dir);
    this.log(`\u21BB #${a.id} qayta biriktirildi (/clear yoki /resume) \u2192 session=${newSessionId.slice(0, 8)}\u2026`);
    return a;
  }
  focusAgent(id) {
    if (!this.terminals.has(id)) {
      const a = this.store.values().find((x) => x.id === id);
      if (a) this.bindByCwd(a);
    }
    const term = this.terminals.get(id);
    if (term) term.show();
  }
  dispose() {
    if (this.scanTimer) clearInterval(this.scanTimer);
    for (const t of this.pendingTimers) clearTimeout(t);
    this.pendingTimers.clear();
    for (const d of this.disposables) d.dispose();
    this.disposables = [];
  }
};

// extension/vscode/historyStore.ts
var fs7 = __toESM(require("fs"));
var os5 = __toESM(require("os"));
var path6 = __toESM(require("path"));
var KEEP_DAYS = 120;
var SESSION_TTL_DAYS = 60;
function emptyStat() {
  return { cost: 0, inTok: 0, outTok: 0, tools: 0, ms: 0 };
}
function localDay(d = /* @__PURE__ */ new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function daysBetween(a, b) {
  return Math.abs((Date.parse(b + "T00:00:00") - Date.parse(a + "T00:00:00")) / 864e5);
}
var HistoryStore = class {
  data = { days: {}, sessions: {} };
  loaded = false;
  /** Fayl mavjud, lekin buzuq → USTIDAN YOZMAYMIZ. */
  corrupt = false;
  dirty = false;
  saveTimer;
  filePath() {
    return path6.join(os5.homedir(), ".agent-office", "history.json");
  }
  load() {
    if (this.loaded) return;
    try {
      const raw = fs7.readFileSync(this.filePath(), "utf8");
      const o = JSON.parse(raw);
      if (o && typeof o === "object" && o.days && o.sessions && typeof o.days === "object" && typeof o.sessions === "object") {
        this.data = o;
      } else {
        this.corrupt = true;
      }
    } catch (e) {
      if (e.code !== "ENOENT") this.corrupt = true;
    }
    this.loaded = true;
    this.prune();
  }
  /** Bitta sessiyaning JORIY absolyut jamini yozadi — o'sish (delta) bugungi
   *  kunga qo'shiladi. cur.* kamaymaydi (jami faqat o'sadi); kamaysa 0 deb olamiz. */
  record(sessionId, project, cur, model) {
    if (!sessionId || !project) return;
    const day = localDay();
    const prev = this.data.sessions[sessionId];
    const dcost = prev ? Math.max(0, cur.cost - prev.cost) : cur.cost;
    const din = prev ? Math.max(0, cur.inTok - prev.inTok) : cur.inTok;
    const dout = prev ? Math.max(0, cur.outTok - prev.outTok) : cur.outTok;
    const dtools = prev ? Math.max(0, cur.tools - prev.tools) : cur.tools;
    const dms = prev ? Math.max(0, cur.ms - prev.ms) : cur.ms;
    if (dcost || din || dout || dtools || dms || !prev) {
      const d = this.data.days[day] ||= {};
      const s = d[project] ||= emptyStat();
      s.cost += dcost;
      s.inTok += din;
      s.outTok += dout;
      s.tools += dtools;
      s.ms += dms;
    }
    const firstSeen = prev?.firstSeen ?? Date.now();
    this.data.sessions[sessionId] = { project, day, firstSeen, cost: cur.cost, inTok: cur.inTok, outTok: cur.outTok, tools: cur.tools, ms: cur.ms, model: model ?? prev?.model };
    this.dirty = true;
    this.scheduleSave();
  }
  /** Webview'ga jo'natish uchun — kunlar ro'yxati (sana bo'yicha). */
  getDays() {
    return Object.entries(this.data.days).map(([date, projects]) => ({ date, projects })).sort((a, b) => a.date.localeCompare(b.date));
  }
  /** So'nggi sessiyalar arxivi — eng yangi birinchi (nom keyin qo'shiladi). */
  getSessions(limit = 60) {
    return Object.entries(this.data.sessions).map(([sessionId, s]) => ({
      sessionId,
      project: s.project,
      at: s.firstSeen ?? (Date.parse(`${s.day}T12:00:00`) || 0),
      cost: s.cost,
      inTok: s.inTok,
      outTok: s.outTok,
      tools: s.tools,
      ms: s.ms,
      model: s.model
    })).sort((a, b) => b.at - a.at).slice(0, limit);
  }
  prune() {
    const today = localDay();
    for (const date of Object.keys(this.data.days)) {
      if (daysBetween(date, today) > KEEP_DAYS) delete this.data.days[date];
    }
    for (const [sid, s] of Object.entries(this.data.sessions)) {
      if (daysBetween(s.day, today) > SESSION_TTL_DAYS) delete this.data.sessions[sid];
    }
  }
  scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = void 0;
      this.save();
    }, 15e3);
  }
  /** Atomik yozuv. corrupt bo'lsa — HECH NARSA yozmaydi. */
  save() {
    if (this.corrupt || !this.dirty) return;
    try {
      const p = this.filePath();
      fs7.mkdirSync(path6.dirname(p), { recursive: true });
      const tmp = `${p}.${process.pid}.tmp`;
      fs7.writeFileSync(tmp, JSON.stringify(this.data));
      fs7.renameSync(tmp, p);
      this.dirty = false;
    } catch {
    }
  }
  /** Yopilishda — kutilayotgan yozuvni majburan saqlaymiz. */
  flush() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = void 0;
    }
    this.save();
  }
};

// extension/vscode/OfficeViewProvider.ts
var VIEW_ID = "agent-office.panelView";
var MAX_PENDING = 1e3;
var OfficeViewProvider = class {
  constructor(extensionUri, version) {
    this.extensionUri = extensionUri;
    this.version = version;
    this.store.on("agentAdded", (agent) => {
      this.logMsg(`+ agent #${agent.id}  folder=${agent.folderName}  role=${agent.role ?? "-"}  session=${agent.sessionId?.slice(0, 8) ?? "-"}  external=${agent.isExternal}`);
      const saved = agent.sessionId ? this.loadNames()[agent.sessionId] : void 0;
      if (saved) agent.customName = saved;
      const savedRole = agent.sessionId ? this.loadRoles()[agent.sessionId] : void 0;
      if (savedRole) {
        agent.role = savedRole;
        agent.roleManual = true;
      }
      this.sendOrBuffer({
        type: "agentCreated",
        id: agent.id,
        folderName: agent.folderName,
        isExternal: agent.isExternal,
        role: agent.role,
        task: agent.task
      });
      if (agent.customName) this.sendOrBuffer({ type: "agentRenamed", id: agent.id, name: agent.customName });
    });
    this.store.on("agentRemoved", (id) => {
      this.logMsg(`- agent #${id} yopildi`);
      this.sendOrBuffer({ type: "agentClosed", id });
    });
    this.store.on("broadcast", (msg) => {
      this.logBroadcast(msg);
      this.sendOrBuffer(msg);
      this.maybeNotify(msg);
      this.trackAttention(msg);
      this.refreshStatusBar();
    });
    this.store.on("agentAdded", () => this.refreshStatusBar());
    this.store.on("agentRemoved", (id) => {
      this.waitingSince.delete(id);
      this.stuck.delete(id);
      this.refreshStatusBar();
    });
    this.stuckTimer = setInterval(() => this.checkStuck(), 3e4);
  }
  extensionUri;
  version;
  view;
  store = new AgentStateStore();
  watcher = new FileWatcher(this.store);
  manager = new AgentManager(this.store, this.watcher, (m) => this.logMsg(m));
  hookServer = new HookServer(
    (sessionId, raw) => this.onHookEvent(sessionId, raw),
    () => (vscode4.workspace.workspaceFolders ?? []).map((f) => f.uri.fsPath)
  );
  hookActive = false;
  folderWatch;
  autoSpawnTimer;
  pending = [];
  ready = false;
  soundEnabled = true;
  statusBar = new OfficeStatusBar();
  history = new HistoryStore();
  log = vscode4.window.createOutputChannel("Agent Office");
  logMsg(m) {
    const t = (/* @__PURE__ */ new Date()).toISOString().slice(11, 19);
    this.log.appendLine(`[${t}] ${m}`);
  }
  // ── E'tibor: kim, qachondan beri kutmoqda ──
  // Ruxsat holati bir necha joyda o'rnatiladi (transcript taymeri, hook), shuning
  // uchun uni BITTA joyda — broadcast oqimida kuzatamiz (parser kodiga tegmaymiz).
  waitingSince = /* @__PURE__ */ new Map();
  stuck = /* @__PURE__ */ new Set();
  stuckTimer;
  trackAttention(msg) {
    if (msg.type === "agentToolPermission") {
      if (!this.waitingSince.has(msg.id)) this.waitingSince.set(msg.id, Date.now());
      return;
    }
    const cleared = msg.type === "agentToolPermissionClear" || msg.type === "agentToolsClear" || msg.type === "agentStatus" && msg.status === "active";
    if (!cleared) return;
    const id = msg.id;
    this.waitingSince.delete(id);
    if (this.stuck.delete(id)) this.sendOrBuffer({ type: "agentStuck", id, stuck: false });
  }
  checkStuck() {
    const now = Date.now();
    for (const id of newlyStuck(this.waitingSince, this.stuck, now)) {
      const a = this.store.get(id);
      if (!a?.permissionActive) {
        this.waitingSince.delete(id);
        continue;
      }
      this.stuck.add(id);
      this.sendOrBuffer({ type: "agentStuck", id, stuck: true });
      this.logMsg(`  #${id} ${Math.round(STUCK_MS / 6e4)} daqiqadan beri ruxsat kutmoqda`);
      if (vscode4.workspace.getConfiguration("agent-office").get("notifications", true)) {
        void vscode4.window.showWarningMessage(`Agent Office \u2014 ${a.folderName}: ${Math.round(STUCK_MS / 6e4)} daqiqadan beri ruxsat kutmoqda \u{1F64B}`, "Ko'rsatish").then((pick) => {
          if (pick === "Ko'rsatish") this.manager.focusAgent(id);
        });
      }
    }
    this.refreshStatusBar();
  }
  refreshStatusBar() {
    this.statusBar.update(
      this.store.values().map((a) => ({
        id: a.id,
        folderName: a.customName || a.folderName,
        permissionActive: a.permissionActive,
        blocked: a.blocked,
        reason: a.blockedReason,
        stuck: this.stuck.has(a.id)
      }))
    );
  }
  /** Ruxsat/blok holatlarida VS Code toast bildirishnomasi (sozlanadi,
   *  agent bo'yicha throttle — spam bo'lmasin). "Ko'rsatish" tugmasi
   *  agent terminaliga o'tkazadi. */
  lastNotify = /* @__PURE__ */ new Map();
  maybeNotify(msg) {
    let id, text;
    if (msg.type === "agentToolPermission") {
      id = msg.id;
      text = "ruxsat so'radi \u{1F514}";
    } else if (msg.type === "agentBlocked" && msg.blocked) {
      id = msg.id;
      text = msg.reason ? `\u26D4 ${msg.reason.slice(0, 90)}` : "bloklandi (xato) \u26D4";
    } else {
      return;
    }
    const enabled = vscode4.workspace.getConfiguration("agent-office").get("notifications", true);
    if (!enabled) return;
    if (this.view?.visible) return;
    const now = Date.now();
    const prev = this.lastNotify.get(id) ?? 0;
    if (now - prev < 4e3) return;
    this.lastNotify.set(id, now);
    const a0 = this.store.get(id);
    const name = a0?.customName || a0?.folderName || `Agent #${id}`;
    void vscode4.window.showWarningMessage(`Agent Office \u2014 ${name}: ${text}`, "Ko'rsatish").then((pick) => {
      if (pick === "Ko'rsatish") this.manager.focusAgent(id);
    });
  }
  /** Muhim holat o'zgarishlarini logga yozadi (token spam'siz). */
  logBroadcast(msg) {
    switch (msg.type) {
      case "agentStatus":
        this.logMsg(`  #${msg.id} \u2192 ${msg.status}${msg.awaitingInput ? " (kirish kutmoqda)" : ""}`);
        break;
      case "agentToolStart":
        this.logMsg(`  #${msg.id} tool: ${msg.status}`);
        break;
      case "agentToolPermission":
        this.logMsg(`  #${msg.id} \u{1F514} ruxsat so'raldi`);
        break;
      case "subagentToolStart":
        this.logMsg(`  #${msg.id} + sub-agent`);
        break;
    }
  }
  activate() {
    this.watcher.start();
    this.manager.start();
    this.logMsg(`Agent Office ${this.version} yoqildi. Ish papkalari: ${(vscode4.workspace.workspaceFolders ?? []).map((f) => f.name).join(", ") || "(yo'q)"}`);
    const hooksEnabled = vscode4.workspace.getConfiguration("agent-office").get("hooksEnabled", true);
    if (hooksEnabled) {
      void this.hookServer.start().then((handle) => {
        if (!handle) {
          this.logMsg("\u26A0 Hook server ishga tushmadi (port xatosi) \u2014 shu oynada faqat JSONL kuzatuvi.");
          this.setHookActive(false);
          return;
        }
        const hookScript = vscode4.Uri.joinPath(this.extensionUri, "dist", "hooks", "claude-hook.js").fsPath;
        const ok = installHooks(hookScript);
        this.logMsg(`Hook server: 127.0.0.1:${handle.port} \xB7 ~/.claude/settings.json hook: ${ok ? "o'rnatildi \u2713" : "o'rnatilmadi \u2717"}`);
        this.setHookActive(true);
      });
      this.folderWatch = vscode4.workspace.onDidChangeWorkspaceFolders(() => this.hookServer.refreshFolders());
      const autoSpawn = vscode4.workspace.getConfiguration("agent-office").get("autoSpawnAgent", false);
      if (autoSpawn && (vscode4.workspace.workspaceFolders?.length ?? 0) > 0) {
        this.autoSpawnTimer = setTimeout(() => {
          this.autoSpawnTimer = void 0;
          if (this.store.size === 0) {
            this.logMsg("autoSpawnAgent: agent yo'q \u2014 bittasini ishga tushiramiz.");
            this.manager.launchAgent();
          }
        }, 2e3);
      }
    } else {
      this.logMsg("Hook rejimi o'chirilgan (agent-office.hooksEnabled=false) \u2014 faqat JSONL.");
      this.setHookActive(false);
    }
  }
  /** Hook holatini saqlab webview'ga yuboradi (ko'rsatkich uchun). */
  setHookActive(active) {
    this.hookActive = active;
    this.sendOrBuffer({ type: "hookStatus", active });
  }
  /** Hook eventini agentga yo'naltiradi. Shu loyiha sessiyasi bo'lsa
   *  agentni avto-yaratadi (+Agent shart emas). */
  onHookEvent(sessionId, raw) {
    const event = raw.hook_event_name;
    this.logMsg(`[hook] ${event}  session=${sessionId.slice(0, 8)}${raw.tool_name ? "  tool=" + raw.tool_name : ""}`);
    if (event === "SessionEnd") {
      this.manager.removeBySession(sessionId);
      return;
    }
    let agent = this.store.findBySession(sessionId);
    if (!agent) {
      const cwd = typeof raw.cwd === "string" ? raw.cwd : void 0;
      if (!cwd || !this.isInWorkspace(cwd)) {
        this.logMsg(`[hook] o'tkazildi \u2014 sessiya bu loyihada emas (cwd=${cwd ?? "?"})`);
        return;
      }
      if (event === "SessionStart") {
        const re = this.manager.reassignForClear(sessionId, cwd);
        if (re) {
          handleHookEvent(this.store, re, raw);
          return;
        }
      }
      agent = this.manager.ensureSessionAgent(sessionId, cwd);
    }
    handleHookEvent(this.store, agent, raw);
  }
  isInWorkspace(cwd) {
    const folders = (vscode4.workspace.workspaceFolders ?? []).map((f) => f.uri.fsPath);
    const norm2 = (p) => p.replace(/[\\/]+$/, "").toLowerCase();
    const c = norm2(cwd);
    return folders.some((f) => {
      const nf = norm2(f);
      return c === nf || c.startsWith(nf + "/") || c.startsWith(nf + "\\");
    });
  }
  sendOrBuffer(msg) {
    if (this.ready && this.view) {
      this.view.webview.postMessage(msg);
    } else {
      this.pending.push(msg);
      if (this.pending.length > MAX_PENDING) this.pending.shift();
    }
  }
  post(msg) {
    this.view?.webview.postMessage(msg);
  }
  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode4.Uri.joinPath(this.extensionUri, "dist", "webview")]
    };
    view.webview.html = this.getWebviewContent(view.webview);
    view.webview.onDidReceiveMessage((msg) => this.onMessage(msg));
    view.onDidDispose(() => {
      this.view = void 0;
      this.ready = false;
    });
  }
  onMessage(msg) {
    const raw = msg;
    if (raw.type === "getConversation" && typeof raw.id === "number") {
      const agent = this.store.get(raw.id);
      if (agent) this.post({ type: "conversation", id: agent.id, messages: agent.chat });
      return;
    }
    switch (msg.type) {
      case "webviewReady":
        this.onWebviewReady();
        break;
      case "launchAgent":
        this.manager.launchAgent(msg);
        break;
      case "focusAgent":
        this.manager.focusAgent(msg.id);
        break;
      case "closeAgent":
        this.manager.closeAgent(msg.id);
        break;
      case "setSoundEnabled":
        this.soundEnabled = msg.enabled;
        break;
      case "saveLayout":
        this.saveLayout(msg.items, msg.floorColor ?? null, msg.wallColor ?? null, msg.packs ?? []);
        break;
      case "saveMedia":
        void this.saveMedia(msg.kind, msg.data);
        break;
      case "saveText":
        void this.saveText(msg.kind, msg.content);
        break;
      case "renameAgent":
        this.renameAgent(msg.id, msg.name);
        break;
      case "setRole":
        this.setRoleOverride(msg.id, msg.role);
        break;
      case "sessionStats":
        this.recordStats(msg.stats);
        break;
      case "budgetAlert":
        this.notifyBudget(msg.spent, msg.limit);
        break;
      case "pinnedAgent":
        this.statusBar.setPinned(msg.label, msg.cost);
        break;
    }
  }
  // ── Budjetdan oshish bildirishnomasi (webview chegaradan O'TISHда yuboradi) ──
  // FAQAT ogohlantirish — hech narsa to'xtatilmaydi. `notifications` sozlamasiga
  // bo'ysunadi; qo'shimcha host throttle ko'p-panel dublikatlaridan himoya qiladi.
  lastBudgetNotify = 0;
  notifyBudget(spent, limit) {
    if (!(limit > 0) || !Number.isFinite(limit) || spent < limit) return;
    if (!vscode4.workspace.getConfiguration("agent-office").get("notifications", true)) return;
    const now = Date.now();
    if (now - this.lastBudgetNotify < 3e4) return;
    this.lastBudgetNotify = now;
    const fmt = (n) => `$${n.toFixed(2)}`;
    void vscode4.window.showWarningMessage(`Agent Office \u2014 \u{1F4B8} Byudjetdan oshdi: ~${fmt(spent)} / ${fmt(limit)} (faqat ogohlantirish)`, "Panelni ochish").then((pick) => {
      if (pick === "Panelni ochish") void vscode4.commands.executeCommand("agent-office.showPanel");
    });
  }
  // ── Tarix — davriy statistikani (webview'dan) sessiya ID bo'yicha yozamiz. ──
  // Cost webview'da hisoblangan; host faqat delta olib kunlik tarixga qo'shadi.
  recordStats(stats) {
    this.history.load();
    for (const s of stats) {
      const agent = this.store.get(s.id);
      if (agent) {
        agent.snapToolCalls = s.tools;
        agent.snapTurns = s.turns;
        agent.snapActiveMs = s.ms;
      }
      if (!agent?.sessionId) continue;
      this.history.record(agent.sessionId, s.project, { cost: s.cost, inTok: s.inTok, outTok: s.outTok, tools: s.tools, ms: s.ms }, s.model);
    }
    this.sendHistory();
  }
  lastHistorySend = 0;
  /** Saqlangan tarixni webview'ga yuboradi (nom bilan). force=true → throttle'siz. */
  sendHistory(force = false) {
    const now = Date.now();
    if (!force && now - this.lastHistorySend < 8e3) return;
    this.lastHistorySend = now;
    this.history.load();
    const names = this.loadNames();
    const sessions = this.history.getSessions().map((s) => ({
      name: names[s.sessionId] || void 0,
      project: s.project,
      at: s.at,
      cost: s.cost,
      inTok: s.inTok,
      outTok: s.outTok,
      tools: s.tools,
      ms: s.ms,
      model: s.model
    }));
    this.post({ type: "historyLoaded", days: this.history.getDays(), sessions });
  }
  // ── Agent nomi (qo'lda) ──
  // Bir repoda ikkita "backend" agent bo'lsa ular bir xil ko'rinardi. Nom
  // SESSIYA ID bo'yicha saqlanadi: webview qayta ochilsa ham, VS Code qayta
  // ishga tushsa ham (sessiya davom etayotgan bo'lsa) nom joyida qoladi.
  namesPath() {
    return path7.join(os6.homedir(), ".agent-office", "names.json");
  }
  names = null;
  loadNames() {
    if (this.names) return this.names;
    try {
      const o = JSON.parse(fs8.readFileSync(this.namesPath(), "utf8"));
      this.names = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch {
      this.names = {};
    }
    return this.names;
  }
  renameAgent(id, raw) {
    const agent = this.store.get(id);
    if (!agent) return;
    const name = sanitizeName(raw);
    agent.customName = name || void 0;
    this.sendOrBuffer({ type: "agentRenamed", id, name });
    this.refreshStatusBar();
    if (!agent.sessionId) return;
    const names = this.loadNames();
    if (name) names[agent.sessionId] = name;
    else delete names[agent.sessionId];
    try {
      const p = this.namesPath();
      fs8.mkdirSync(path7.dirname(p), { recursive: true });
      const tmp = `${p}.${process.pid}.tmp`;
      fs8.writeFileSync(tmp, JSON.stringify(names));
      fs8.renameSync(tmp, p);
    } catch {
    }
  }
  // ── Rol override (qo'lda tuzatish) — nom kabi SESSIYA ID bo'yicha saqlanadi.
  //    Avtomatik aniqlash noto'g'ri bo'lsa foydalanuvchi tuzatadi; qayta ochilsa
  //    ham (sessiya davom etsa) tuzatma joyida qoladi.
  rolesPath() {
    return path7.join(os6.homedir(), ".agent-office", "roles.json");
  }
  roleOverrides = null;
  loadRoles() {
    if (this.roleOverrides) return this.roleOverrides;
    try {
      const o = JSON.parse(fs8.readFileSync(this.rolesPath(), "utf8"));
      this.roleOverrides = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch {
      this.roleOverrides = {};
    }
    return this.roleOverrides;
  }
  setRoleOverride(id, raw) {
    const agent = this.store.get(id);
    if (!agent) return;
    const VALID = /* @__PURE__ */ new Set(["research", "frontend", "backend", "qa", "docs", "data"]);
    const role = typeof raw === "string" && VALID.has(raw) ? raw : "";
    if (role) {
      agent.role = role;
      agent.roleManual = true;
      this.sendOrBuffer({ type: "agentRoleDetected", id, role });
    } else {
      agent.roleManual = false;
      agent.role = void 0;
      agent.roleScores = {};
      this.sendOrBuffer({ type: "agentRoleDetected", id, role: "" });
    }
    if (!agent.sessionId) return;
    const roles = this.loadRoles();
    if (role) roles[agent.sessionId] = role;
    else delete roles[agent.sessionId];
    try {
      const p = this.rolesPath();
      fs8.mkdirSync(path7.dirname(p), { recursive: true });
      const tmp = `${p}.${process.pid}.tmp`;
      fs8.writeFileSync(tmp, JSON.stringify(roles));
      fs8.renameSync(tmp, p);
    } catch {
    }
  }
  /** Ofis surati/klipi — FOYDALANUVCHI tanlagan joyga (saqlash oynasi). Sukut
   *  bo'yicha hech qayerga yozilmaydi va hech qayerga yuborilmaydi. */
  async saveMedia(kind, data) {
    if (typeof data !== "string" || !/^[A-Za-z0-9+/=]+$/.test(data) || data.length > 8e7) return;
    const d = /* @__PURE__ */ new Date();
    const p = (n) => String(n).padStart(2, "0");
    const name = `agent-office-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${kind}`;
    const dir = vscode4.workspace.workspaceFolders?.[0]?.uri.fsPath ?? os6.homedir();
    const uri = await vscode4.window.showSaveDialog({
      defaultUri: vscode4.Uri.file(path7.join(dir, name)),
      filters: kind === "png" ? { Image: ["png"] } : { Video: ["webm"] }
    });
    if (!uri) return;
    try {
      fs8.writeFileSync(uri.fsPath, Buffer.from(data, "base64"));
      vscode4.window.showInformationMessage(`Agent Office: ${path7.basename(uri.fsPath)}`);
    } catch (e) {
      vscode4.window.showErrorMessage(`Agent Office: ${e.message}`);
    }
  }
  /** Hisobot/hikoya matni (.md) — FOYDALANUVCHI tanlagan joyga (saqlash oynasi).
   *  Matn webview'da o'lchangan holatdan yasaladi; hech qayerga jo'natilmaydi. */
  async saveText(kind, content) {
    if (typeof content !== "string" || content.length === 0 || content.length > 5e6) return;
    const d = /* @__PURE__ */ new Date();
    const p = (n) => String(n).padStart(2, "0");
    const ext = kind === "history" ? "csv" : kind === "html" ? "html" : "md";
    const name = `agent-office-${kind}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${ext}`;
    const dir = vscode4.workspace.workspaceFolders?.[0]?.uri.fsPath ?? os6.homedir();
    const filters = kind === "history" ? { CSV: ["csv"] } : kind === "html" ? { HTML: ["html"] } : { Markdown: ["md"] };
    const uri = await vscode4.window.showSaveDialog({
      defaultUri: vscode4.Uri.file(path7.join(dir, name)),
      filters
    });
    if (!uri) return;
    try {
      fs8.writeFileSync(uri.fsPath, content, "utf8");
      vscode4.window.showInformationMessage(`Agent Office: ${path7.basename(uri.fsPath)}`);
    } catch (e) {
      vscode4.window.showErrorMessage(`Agent Office: ${e.message}`);
    }
  }
  // ── Git xabardorligi (branch + o'zgargan fayllar; child_process YO'Q) ──
  gitTimer;
  sendGitInfo() {
    const repos = [];
    for (const f of vscode4.workspace.workspaceFolders ?? []) {
      const g = gitInfoForPath(f.uri.fsPath);
      if (g) repos.push({ name: f.name, branch: g.branch, changed: g.changed, staged: g.staged, unstaged: g.unstaged, ahead: g.ahead, behind: g.behind });
    }
    this.post({ type: "gitStatus", repos });
  }
  /** Git holatini vaqti-vaqti bilan yangilaydi (VS Code Git API o'zgarishlarini
   *  aniq kuzatish o'rniga oddiy taymer — arzon, ishonchli). */
  startGitRefresh() {
    if (this.gitTimer) return;
    this.gitTimer = setInterval(() => this.sendGitInfo(), 5e3);
  }
  layoutPath() {
    return path7.join(os6.homedir(), ".agent-office", "layout.json");
  }
  /** Foydalanuvchi ofis layout'ini atomik saqlaydi. */
  saveLayout(items, floorColor, wallColor, packs) {
    try {
      const p = this.layoutPath();
      fs8.mkdirSync(path7.dirname(p), { recursive: true });
      const tmp = `${p}.${process.pid}.tmp`;
      fs8.writeFileSync(tmp, JSON.stringify({ items, floorColor, wallColor, packs }));
      fs8.renameSync(tmp, p);
    } catch {
    }
  }
  loadLayout() {
    try {
      const o = JSON.parse(fs8.readFileSync(this.layoutPath(), "utf8"));
      return {
        items: Array.isArray(o?.items) ? o.items : [],
        floorColor: typeof o?.floorColor === "string" ? o.floorColor : null,
        wallColor: typeof o?.wallColor === "string" ? o.wallColor : null,
        packs: Array.isArray(o?.packs) ? o.packs : []
      };
    } catch {
      return { items: [], floorColor: null, wallColor: null, packs: [] };
    }
  }
  /** Boot ketma-ketligi (tartib muhim). */
  onWebviewReady() {
    this.ready = true;
    this.post({
      type: "providerCapabilities",
      readingTools: [...READING_TOOLS],
      subagentToolNames: [...SUBAGENT_TOOL_NAMES]
    });
    this.post({
      type: "settingsLoaded",
      soundEnabled: this.soundEnabled,
      extensionVersion: this.version
    });
    {
      const lay = this.loadLayout();
      this.post({ type: "layoutLoaded", items: lay.items, floorColor: lay.floorColor, wallColor: lay.wallColor, packs: lay.packs });
    }
    this.sendHistory(true);
    this.post({
      type: "workspaceFolders",
      folders: (vscode4.workspace.workspaceFolders ?? []).map((f) => ({
        name: f.name,
        path: f.uri.fsPath
      }))
    });
    this.sendGitInfo();
    this.startGitRefresh();
    const agents = this.store.values();
    this.post({
      type: "existingAgents",
      agents: agents.map((a) => a.id),
      folderNames: Object.fromEntries(agents.map((a) => [a.id, a.folderName])),
      roles: Object.fromEntries(agents.filter((a) => a.role).map((a) => [a.id, a.role])),
      externals: agents.filter((a) => a.isExternal).map((a) => a.id)
    });
    this.post({ type: "hookStatus", active: this.hookActive });
    for (const a of agents) {
      for (const msg of agentSnapshotMessages(a)) this.post(msg);
    }
    for (const id of this.stuck) this.post({ type: "agentStuck", id, stuck: true });
    this.pending = [];
  }
  getWebviewContent(webview) {
    const distPath = vscode4.Uri.joinPath(this.extensionUri, "dist", "webview");
    const indexPath = path7.join(distPath.fsPath, "index.html");
    let html;
    try {
      html = fs8.readFileSync(indexPath, "utf8");
    } catch {
      return `<html><body style="font-family:sans-serif;padding:20px;color:#ddd;background:#111">
        <h3>Agent Office</h3><p>Webview qurilmagan. <code>npm run build</code> ni ishga tushiring.</p></body></html>`;
    }
    html = html.replace(/(href|src)="\.?\/([^"]+)"/g, (_m, attr, file) => {
      const uri = webview.asWebviewUri(vscode4.Uri.joinPath(distPath, file));
      return `${attr}="${uri}"`;
    });
    const baseUri = webview.asWebviewUri(distPath).toString().replace(/\/$/, "");
    html = html.replace(
      /<head>/i,
      `<head><script>window.__ASSET_BASE__ = ${JSON.stringify(baseUri + "/")};</script>`
    );
    return html;
  }
  dispose() {
    if (this.autoSpawnTimer) clearTimeout(this.autoSpawnTimer);
    if (this.gitTimer) clearInterval(this.gitTimer);
    if (this.stuckTimer) clearInterval(this.stuckTimer);
    this.folderWatch?.dispose();
    this.history.flush();
    this.statusBar.dispose();
    this.watcher.stop();
    this.manager.dispose();
    this.hookServer.stop();
    this.store.disposeAll();
    this.log.dispose();
  }
};

// extension/vscode/extension.ts
function activate(context) {
  const version = context.extension.packageJSON.version ?? "0.0.0";
  const provider = new OfficeViewProvider(context.extensionUri, version);
  provider.activate();
  const hookScript = vscode5.Uri.joinPath(context.extensionUri, "dist", "hooks", "claude-hook.js").fsPath;
  context.subscriptions.push(
    // retainContextWhenHidden: panel yashiringanda webview o'chmaydi —
    // boshqa oynaga o'tib qaytganda holat 0dan boshlanmaydi.
    vscode5.window.registerWebviewViewProvider(VIEW_ID, provider, {
      webviewOptions: { retainContextWhenHidden: true }
    }),
    vscode5.commands.registerCommand("agent-office.showPanel", () => {
      vscode5.commands.executeCommand("agent-office.panelView.focus");
    }),
    vscode5.commands.registerCommand("agent-office.showDiagnostics", () => {
      provider.log.show(true);
    }),
    vscode5.commands.registerCommand("agent-office.installHooks", () => {
      const ok = installHooks(hookScript);
      vscode5.window.showInformationMessage(
        ok ? "Agent Office: Claude hook'lari o'rnatildi." : "Agent Office: hook o'rnatib bo'lmadi."
      );
    }),
    vscode5.commands.registerCommand("agent-office.uninstallHooks", () => {
      uninstallHooks(hookScript);
      vscode5.window.showInformationMessage("Agent Office: Claude hook'lari olib tashlandi.");
    }),
    { dispose: () => provider.dispose() }
  );
  const autoShow = vscode5.workspace.getConfiguration("agent-office").get("autoShowPanel", false);
  if (autoShow) {
    vscode5.commands.executeCommand("agent-office.panelView.focus");
  }
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
