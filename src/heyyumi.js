// HeyYumi MCP 서버를 직접 부르는 최소 클라이언트 (Streamable HTTP, JSON-RPC 2.0).
// 예약 요청 버튼, 그리고 Claude 키 없이 HeyYumi 키만 있을 때의 검색에 쓴다.
import { get } from "./config.js";

let session = null; // { id, url, token }
let nextId = 1;

async function rpc(method, params, { notify = false } = {}) {
  const url = get("HEYYUMI_MCP_URL");
  const token = get("HEYYUMI_API_KEY");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${token}`,
  };
  if (session?.id) headers["Mcp-Session-Id"] = session.id;

  const body = { jsonrpc: "2.0", method, params };
  if (!notify) body.id = nextId++;

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (res.status === 401) throw new Error("HeyYumi 인증 실패: HEYYUMI_API_KEY 를 확인해 주세요.");
  if (!res.ok && res.status !== 202) throw new Error(`HeyYumi 오류 (${res.status}): ${await res.text()}`);

  const sid = res.headers.get("mcp-session-id");
  if (sid && session) session.id = sid;
  if (notify || res.status === 202) return null;

  // 응답은 JSON 이거나 SSE(data: ...) 형태
  const text = await res.text();
  const payload = (res.headers.get("content-type") || "").includes("text/event-stream")
    ? text
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => JSON.parse(l.slice(5)))
        .find((m) => m.id === body.id)
    : JSON.parse(text);
  if (payload?.error) throw new Error(`HeyYumi 오류: ${payload.error.message}`);
  return payload?.result;
}

async function ensureSession() {
  const url = get("HEYYUMI_MCP_URL");
  const token = get("HEYYUMI_API_KEY");
  if (session && session.url === url && session.token === token) return;
  session = { id: null, url, token };
  await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "golmokpick", version: "0.1.0" },
  });
  await rpc("notifications/initialized", {}, { notify: true });
}

export async function callTool(name, args) {
  try {
    await ensureSession();
    return parseToolResult(await rpc("tools/call", { name, arguments: args }));
  } catch (err) {
    session = null; // 다음 호출에서 세션을 새로 연다
    throw err;
  }
}

function parseToolResult(result) {
  const text = (result?.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
  if (result?.isError) throw new Error(text || "HeyYumi 도구 호출 실패");
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}
