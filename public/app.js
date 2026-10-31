const $ = (s) => document.querySelector(s);
const log = $("#log");
const history = []; // { role, content }

const MODE_LABEL = {
  claude: "Claude + HeyYumi",
  "claude-demo": "Claude + 샘플",
  heyyumi: "HeyYumi",
  demo: "데모",
};

function api(url, body) {
  return fetch(url, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", "X-Golmokpick": "1" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `요청 실패 (${r.status})`);
    return data;
  });
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function addMsg(role, text, extra = "") {
  const m = el("div", `msg ${role === "user" ? "user" : "bot"} ${extra}`, text);
  log.append(m);
  log.scrollTop = log.scrollHeight;
  return m;
}

function addCard(c) {
  const card = el("article", "card");
  const tags = el("div", "tags");
  for (const t of c.tags || []) tags.append(el("span", `tag ${t.includes("빠듯") ? "warn" : ""}`, t));
  if (c.demo) tags.append(el("span", "tag sample", "샘플"));
  if (tags.children.length) card.append(tags);

  const h = el("h3");
  if (c.placeUrl) {
    const a = el("a", "", c.name);
    a.href = c.placeUrl;
    a.target = "_blank";
    a.rel = "noopener";
    h.append(a);
  } else h.textContent = c.name;
  card.append(h);

  const where = [c.category, c.walkMin != null ? `광운대역 도보 약 ${c.walkMin}분` : null].filter(Boolean).join(" · ");
  if (where) card.append(el("p", "meta", where));
  if (c.menu) card.append(el("p", "line", c.menu));
  if (c.hours) card.append(el("p", "line", c.hours));

  if (c.canReserve) {
    const b = el("button", "primary", "예약 요청 보내기");
    b.onclick = () => openReserve(c);
    card.append(b);
  }
  log.append(card);
  log.scrollTop = log.scrollHeight;
}

async function send(text) {
  text = text.trim();
  if (!text) return;
  addMsg("user", text);
  history.push({ role: "user", content: text });
  const typing = addMsg("bot", "가게를 고르고 있어요…", "typing");
  $("#input").disabled = true;
  try {
    const res = await api("/api/chat", { messages: history });
    typing.remove();
    addMsg("bot", res.text || "추천 결과예요.");
    history.push({ role: "assistant", content: res.text || "" });
    (res.cards || []).forEach(addCard);
  } catch (err) {
    typing.remove();
    addMsg("bot", err.message, "error");
    history.pop(); // 실패한 질문은 대화 기록에서 뺀다
  } finally {
    $("#input").disabled = false;
    $("#input").focus();
  }
}

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = $("#input").value;
  $("#input").value = "";
  send(v);
});
document.querySelectorAll(".chips button").forEach((b) => (b.onclick = () => send(b.dataset.q)));

// ── 설정 ─────────────────────────
function renderStatus(s) {
  $("#mode").textContent = MODE_LABEL[s.mode] || s.mode;
  $("#banner").hidden = s.anthropic.set || s.heyyumi.set;
  $("#anthropicNow").textContent = s.anthropic.set ? `저장됨: ${s.anthropic.preview}` : "아직 없음 → 데모 모드";
  $("#heyyumiNow").textContent = s.heyyumi.set ? `저장됨: ${s.heyyumi.preview}` : "아직 없음 → 샘플 가게 데이터";
  $("#settingsForm").ANTHROPIC_MODEL.placeholder = s.model;
  $("#settingsForm").HEYYUMI_MCP_URL.placeholder = s.heyyumiUrl;
}

const settings = $("#settings");
const openSettings = () => settings.showModal();
$("#openSettings").onclick = openSettings;
document.querySelectorAll("[data-open-settings]").forEach((b) => (b.onclick = openSettings));
$("#closeSettings").onclick = () => settings.close();

$("#settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const s = await api("/api/settings", Object.fromEntries(f.entries()));
  e.target.reset();
  renderStatus(s);
  settings.close();
  addMsg("bot", `설정을 저장했어요. 지금 모드: ${MODE_LABEL[s.mode]}`);
});

$("#clearKeys").onclick = async () => {
  if (!confirm("저장된 API 키를 모두 지울까요?")) return;
  renderStatus(await api("/api/settings", { clear: ["ANTHROPIC_API_KEY", "HEYYUMI_API_KEY"] }));
};

// ── 예약 요청 ─────────────────────
const reserve = $("#reserve");
let reserving = null;

function openReserve(c) {
  reserving = c;
  $("#reservePlace").textContent = c.name;
  const f = $("#reserveForm");
  const d = new Date(Date.now() + 2 * 3600 * 1000);
  d.setMinutes(0, 0, 0);
  f.time.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  $("#reserveHint").textContent = c.demo
    ? "샘플 가게라서 실제로 보내지 않고 흐름만 보여드려요."
    : "보내면 가게에 바로 알림이 가고, 5분 안에 수락 여부를 알려 드려요.";
  reserve.showModal();
}
$("#closeReserve").onclick = () => reserve.close();

$("#reserveForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  reserve.close();
  const c = reserving;
  // datetime-local 은 시간대가 없으므로 한국 시간(+09:00)으로 보낸다
  const reservationTime = `${f.time.value}:00+09:00`;
  addMsg("user", `${c.name} · ${f.time.value.replace("T", " ")} · ${f.count.value}명 예약 요청`);
  try {
    const r = await api("/api/reserve", {
      placeId: c.id, reservationTime, guestCount: Number(f.count.value),
      guestName: f.name.value, guestPhone: f.phone.value, note: f.note.value,
    });
    if (r.reviewStartsAt) {
      addMsg("bot", r.yumiNextStep || "가게 확인 시간에 맞춰 검토돼요. 결과는 문자로 받아요.");
      return;
    }
    addMsg("bot", `예약 요청을 보냈어요${r.demo ? " (데모)" : ""}. 5분 안에 수락 여부를 알려 드릴게요.`);
    if (r.reservationId) poll(r.reservationId);
  } catch (err) {
    addMsg("bot", err.message, "error");
  }
});

async function poll(id, tries = 0) {
  try {
    const r = await api(`/api/reservation/${encodeURIComponent(id)}`);
    if (!r.settled && tries < 20) return setTimeout(() => poll(id, tries + 1), r.demo ? 1500 : 1000);
    const text = { confirmed: "예약이 확정됐어요! 🎉", cancelled: "가게에서 이번 요청은 어렵다고 했어요. 다른 곳을 찾아볼까요?", expired: "가게 답이 없었어요. 다른 시간이나 가게로 다시 요청해 볼까요?" }[r.status];
    addMsg("bot", text || `예약 상태: ${r.status}`);
  } catch (err) {
    addMsg("bot", err.message, "error");
  }
}

api("/api/settings").then(renderStatus).catch(() => {});
