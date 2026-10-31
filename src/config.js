// .env 읽기/쓰기. 앱의 ⚙️ 설정 화면에서 입력한 키도 여기로 저장된다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = path.join(root, ".env");
const EXAMPLE_PATH = path.join(root, ".env.example");

// 설정 화면에서 바꿀 수 있는 키만 허용
export const EDITABLE_KEYS = ["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL", "HEYYUMI_API_KEY", "HEYYUMI_MCP_URL"];

const DEFAULTS = {
  ANTHROPIC_MODEL: "claude-opus-5-5",
  HEYYUMI_MCP_URL: "https://mcp.heyyumi.ai/mcp",
  PORT: "3000",
};

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return out;
}

export function loadEnv() {
  if (!fs.existsSync(ENV_PATH) && fs.existsSync(EXAMPLE_PATH)) {
    fs.copyFileSync(EXAMPLE_PATH, ENV_PATH);
    fs.chmodSync(ENV_PATH, 0o600);
  }
  const fileVals = fs.existsSync(ENV_PATH) ? parseEnv(fs.readFileSync(ENV_PATH, "utf8")) : {};
  for (const [k, v] of Object.entries({ ...DEFAULTS, ...fileVals })) {
    // 셸에서 export 한 값이 있으면 그걸 우선한다
    if (!process.env[k] && v !== "") process.env[k] = v;
  }
}

export function get(key) {
  return process.env[key] || DEFAULTS[key] || "";
}

// .env 의 해당 줄만 바꾸고 주석/순서는 유지
export function saveEnv(updates) {
  let text = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
  for (const [key, raw] of Object.entries(updates)) {
    if (!EDITABLE_KEYS.includes(key)) continue;
    const value = String(raw ?? "").trim().replace(/[\r\n]/g, "");
    const re = new RegExp(`^\\s*${key}\\s*=.*$`, "m");
    text = re.test(text) ? text.replace(re, `${key}=${value}`) : `${text.trimEnd()}\n${key}=${value}\n`;
    if (value) process.env[key] = value;
    else delete process.env[key];
  }
  fs.writeFileSync(ENV_PATH, text, { mode: 0o600 });
}

function mask(v) {
  if (!v) return "";
  return v.length <= 8 ? "••••" : `${v.slice(0, 6)}••••${v.slice(-4)}`;
}

export function status() {
  return {
    anthropic: { set: Boolean(get("ANTHROPIC_API_KEY")), preview: mask(get("ANTHROPIC_API_KEY")) },
    heyyumi: { set: Boolean(get("HEYYUMI_API_KEY")), preview: mask(get("HEYYUMI_API_KEY")) },
    model: get("ANTHROPIC_MODEL"),
    heyyumiUrl: get("HEYYUMI_MCP_URL"),
    mode: mode(),
  };
}

// claude: Claude + HeyYumi 실데이터 / claude-demo: Claude + 샘플 데이터
// heyyumi: 규칙 기반 + HeyYumi 실데이터 / demo: 전부 샘플
export function mode() {
  const a = Boolean(get("ANTHROPIC_API_KEY"));
  const h = Boolean(get("HEYYUMI_API_KEY"));
  if (a && h) return "claude";
  if (a) return "claude-demo";
  if (h) return "heyyumi";
  return "demo";
}
