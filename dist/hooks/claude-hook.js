#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// extension/server/hooks/claudeHook.ts
var fs = __toESM(require("node:fs"));
var http = __toESM(require("node:http"));
var os = __toESM(require("node:os"));
var path = __toESM(require("node:path"));

// extension/core/hookRouting.ts
function normPath(p) {
  const s = p.replace(/[\\/]+/g, "/").replace(/\/+$/, "");
  return process.platform === "win32" ? s.toLowerCase() : s;
}
function within(cwd, folder) {
  const c = normPath(cwd);
  const f = normPath(folder);
  return c === f || c.startsWith(f + "/");
}
function pickServerForCwd(servers, cwd) {
  let best = null;
  let bestLen = -1;
  for (const s of servers) {
    for (const f of s.folders || []) {
      const len = normPath(f).length;
      if (within(cwd, f) && len > bestLen) {
        best = s;
        bestLen = len;
      }
    }
  }
  return best;
}

// extension/server/hooks/claudeHook.ts
function done() {
  process.exit(0);
}
function aoDir() {
  return path.join(os.homedir(), ".agent-office");
}
function readServers() {
  const out = [];
  let names;
  try {
    names = fs.readdirSync(path.join(aoDir(), "servers"));
  } catch {
    return out;
  }
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    try {
      const e = JSON.parse(fs.readFileSync(path.join(aoDir(), "servers", name), "utf8"));
      if (e && typeof e.port === "number" && typeof e.token === "string") {
        out.push({ port: e.port, token: e.token, pid: typeof e.pid === "number" ? e.pid : 0, folders: Array.isArray(e.folders) ? e.folders : [] });
      }
    } catch {
    }
  }
  return out;
}
function readLegacy() {
  try {
    const e = JSON.parse(fs.readFileSync(path.join(aoDir(), "server.json"), "utf8"));
    return typeof e.port === "number" && typeof e.token === "string" ? { port: e.port, token: e.token } : null;
  } catch {
    return null;
  }
}
var data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => {
  data += c;
});
process.stdin.on("end", () => {
  try {
    const body = data || "{}";
    let cwd = "";
    try {
      const j = JSON.parse(body);
      if (j && typeof j.cwd === "string") cwd = j.cwd;
    } catch {
    }
    const servers = readServers();
    let target = cwd ? pickServerForCwd(servers, cwd) : null;
    if (!target) target = readLegacy() ?? servers[0] ?? null;
    if (!target) done();
    const req = http.request(
      {
        host: "127.0.0.1",
        port: target.port,
        path: "/api/hooks/claude",
        method: "POST",
        timeout: 1500,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${target.token}`,
          "content-length": Buffer.byteLength(body)
        }
      },
      (res) => {
        res.resume();
        res.on("end", done);
      }
    );
    req.on("error", done);
    req.on("timeout", () => {
      req.destroy();
      done();
    });
    req.write(body);
    req.end();
  } catch {
    done();
  }
});
process.stdin.on("error", done);
setTimeout(done, 2500);
//# sourceMappingURL=claude-hook.js.map
