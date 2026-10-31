// 골목픽 로컬 서버: 정적 화면 + 채팅/설정/예약 API
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { loadEnv, saveEnv, status, mode, get } from "./src/config.js";
import { chat } from "./src/claude.js";
import { callTool } from "./src/heyyumi.js";
import { parseConditions, searchDemo, searchHeyYumi, describeConditions, maxWalkMinutes } from "./src/places.js";

loadEnv();

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: "200kb" }));
app.use(express.static(path.join(here, "public")));

// 다른 사이트가 브라우저를 통해 이 API를 부르지 못하게 커스텀 헤더를 요구한다 (CORS preflight 차단)
app.use("/api", (req, res, next) => {
  if (req.method !== "GET" && req.get("X-Golmokpick") !== "1") return res.status(403).json({ error: "forbidden" });
  next();
});

app.get("/api/settings", (_req, res) => res.json(status()));

app.post("/api/settings", (req, res) => {
  const body = req.body || {};
  const updates = {};
  // 빈 문자열은 '변경 안 함', clear 배열에 든 키는 삭제
  for (const k of ["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL", "HEYYUMI_API_KEY", "HEYYUMI_MCP_URL"]) {
    if (typeof body[k] === "string" && body[k].trim()) updates[k] = body[k].trim();
  }
  for (const k of body.clear || []) updates[k] = "";
  saveEnv(updates);
  res.json(status());
});

app.post("/api/chat", async (req, res) => {
  const history = (req.body?.messages || [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-20);
  if (!history.length || history.at(-1).role !== "user") return res.status(400).json({ error: "메시지가 비어 있어요." });

  const m = mode();
  try {
    if (m === "claude" || m === "claude-demo") {
      const out = await chat(history, { useHeyYumi: m === "claude" });
      return res.json({ ...out, mode: m });
    }
    // Claude 키가 없으면 규칙 기반으로 조건을 뽑아 검색한다
    const c = parseConditions(history.at(-1).content);
    const cards = m === "heyyumi" ? await searchHeyYumi(c) : searchDemo(c);
    const walk = maxWalkMinutes(c);
    const text = cards.length
      ? `${describeConditions(c)} 조건으로 찾아봤어요.${walk ? ` 편도 도보 ${walk}분 안쪽 위주예요.` : ""}`
      : "조건에 맞는 가게를 못 찾았어요. 예산이나 시간을 조금 넓혀 볼까요?";
    res.json({ text, cards, mode: m, conditions: c });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: friendlyError(err) });
  }
});

// 예약 요청: 사용자가 카드에서 직접 버튼을 누르고 정보를 입력했을 때만 보낸다
app.post("/api/reserve", async (req, res) => {
  const { placeId, reservationTime, guestCount, guestName, guestPhone, note } = req.body || {};
  if (!placeId || !reservationTime || !guestCount || !guestPhone) {
    return res.status(400).json({ error: "가게, 날짜·시간, 인원, 연락처가 필요해요." });
  }
  if (!get("HEYYUMI_API_KEY") || String(placeId).startsWith("demo-")) {
    // 데모: 실제로 보내지 않고 흐름만 보여준다
    return res.json({ demo: true, status: "pending", reservationId: `demo-${Date.now()}` });
  }
  try {
    const out = await callTool("request_reservation", {
      placeId: String(placeId),
      reservationTime,
      guestCount: Number(guestCount),
      guestName,
      guestPhone,
      note,
      guestLanguage: "ko",
      idempotencyKey: `${placeId}-${reservationTime}-${guestPhone}`,
    });
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: friendlyError(err) });
  }
});

app.get("/api/reservation/:id", async (req, res) => {
  const id = req.params.id;
  if (id.startsWith("demo-")) {
    const elapsed = Date.now() - Number(id.slice(5));
    return res.json({ demo: true, settled: elapsed > 4000, status: elapsed > 4000 ? "confirmed" : "pending" });
  }
  try {
    res.json(await callTool("wait_for_reservation", { reservationId: id }));
  } catch (err) {
    res.status(500).json({ error: friendlyError(err) });
  }
});

function friendlyError(err) {
  if (err instanceof Anthropic.AuthenticationError) return "Claude API 키가 올바르지 않아요. ⚙️ 설정에서 다시 넣어 주세요.";
  if (err instanceof Anthropic.RateLimitError) return "Claude API 요청이 많아요. 잠시 후 다시 시도해 주세요.";
  if (err instanceof Anthropic.APIError) return `Claude API 오류 (${err.status}): ${err.message}`;
  return err?.message || "알 수 없는 오류가 났어요.";
}

const port = Number(get("PORT")) || 3000;
// 127.0.0.1 에만 열어서 같은 와이파이의 다른 기기에서 키 설정에 접근하지 못하게 한다
app.listen(port, "127.0.0.1", () => {
  console.log(`\n  골목픽 실행 중 → http://localhost:${port}`);
  console.log(`  모드: ${mode()}  (⚙️ 설정에서 API 키를 넣으면 바뀌어요)\n`);
});
