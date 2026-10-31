// Claude 가 사용자의 말을 검색 조건으로 바꾸고, 가게 검색 도구를 불러 추천 문장을 만든다.
// 가게 검색은 서버가 실행한다: HeyYumi 키가 있으면 실데이터, 없으면 샘플 데이터.
import Anthropic from "@anthropic-ai/sdk";
import { get } from "./config.js";
import { callTool } from "./heyyumi.js";
import { AREA, parseConditions, searchDemo, toCard } from "./places.js";

const SYSTEM = `너는 '골목픽'이야. 광운대학교 학생에게 학교 앞(광운대역·광운대 남단·공릉역, 반경 약 500m~1km) 골목 가게를 골라 주는 AI야.

원칙
- 학생이 말한 공강 시간, 인원, 예산을 먼저 파악해. 빠진 게 있어도 일단 합리적으로 가정해서 검색하고, 가정한 건 한 줄로 밝혀.
- 가게는 반드시 search_places 도구로 찾아. 도구가 돌려준 가게만 추천하고, 없는 정보(가격·영업시간·별점)는 지어내지 마.
- 공강 안에 다녀올 수 있는지 도보 시간(distanceM ÷ 70m/분)으로 따져. 식사는 보통 30~40분, 왕복 이동 포함해서 계산해.
- 혼밥이면 영업 중이고 가까운 곳, 단체면 단체 이용·예약 요청 가능한 곳을 우선해.
- 예약은 네가 직접 보내지 않아. 예약 요청이 가능한 가게는 "카드의 '예약 요청 보내기' 버튼을 누르면 5분 안에 수락 여부를 알려 드려요"라고 안내해. 확정됐다고 말하지 마.
- 답은 짧게. 2~3곳 추천, 각 가게는 한 줄 이유. 친근한 존댓말(~요). 마크다운 표는 쓰지 마.`;

const TOOLS = [
  {
    name: "search_places",
    description:
      "광운대 주변 가게를 검색한다 (HeyYumi 검증 데이터). 결과의 distanceM 은 광운대역 기준 직선거리(m). " +
      "yumiBooking.canRequest=true 면 예약 요청 가능.",
    input_schema: {
      type: "object",
      properties: {
        business_category: { type: "string", enum: ["restaurant", "cafe", "bar"], description: "식사=restaurant, 카공=cafe, 술=bar" },
        keyword: { type: "string", description: "음식/메뉴 이름만 (예: 국수, 돈까스)" },
        subtype: { type: "string", description: "가게 종류 (예: noodles, korean_bbq, coffee, gukbap_soup)" },
        open_at: { type: "string", description: "now, 19:00, 2026-11-06 19:00, 점심 등" },
        max_dish_price: { type: "integer", description: "메뉴 하나 가격 상한(원)" },
        good_value: { type: "string", enum: ["true"], description: "가성비" },
        group_friendly: { type: "string", enum: ["true"], description: "단체 가능" },
        recommended_for: { type: "string", description: "solo_dining, group_dining, group_drinking, date 등" },
        reservation_channel: { type: "string", enum: ["yumi"], description: "예약 요청 가능한 곳만" },
        power_outlets: { type: "string", enum: ["true"], description: "콘센트 (카공)" },
        page_size: { type: "integer", minimum: 1, maximum: 10 },
      },
      additionalProperties: false,
    },
  },
];

function client() {
  return new Anthropic({ apiKey: get("ANTHROPIC_API_KEY") });
}

async function runSearch(input, userText, useHeyYumi) {
  if (useHeyYumi) {
    const res = await callTool("search_places", { region_name: AREA, page_size: 6, fields: "quality", ...input });
    return { raw: res, cards: (res.data || []).map((p) => toCard(p)) };
  }
  // 샘플 데이터: 사용자 문장 조건 + Claude 가 고른 카테고리로 필터
  const c = parseConditions(userText);
  if (input.business_category === "cafe") c.purpose = "cafe";
  if (input.group_friendly || input.recommended_for?.startsWith("group")) c.purpose = "group";
  if (input.max_dish_price) c.budget = input.max_dish_price;
  const cards = searchDemo(c);
  return { raw: { data: cards, note: "샘플 데이터입니다 (HeyYumi 키 미설정)" }, cards };
}

// history: [{ role: "user"|"assistant", content: string }]
export async function chat(history, { useHeyYumi }) {
  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "full", timeStyle: "short" });
  const messages = history.map((m) => ({ role: m.role, content: m.content }));
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content || "";
  let cards = [];

  for (let i = 0; i < 6; i++) {
    const response = await client().beta.messages.create({
      model: get("ANTHROPIC_MODEL"),
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "low" }, // 채팅은 빠른 응답이 중요
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: `지금 시각(한국): ${now}` },
      ],
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === "refusal") {
      return { text: "이 요청은 도와드리기 어려워요. 공강 시간, 인원, 예산으로 다시 말해 주세요.", cards };
    }

    const toolUses = response.content.filter((b) => b.type === "tool_use");
    if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
      const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      return { text, cards };
    }

    messages.push({ role: "assistant", content: response.content });
    const results = await Promise.all(
      toolUses.map(async (tu) => {
        try {
          const { raw, cards: found } = await runSearch(tu.input, lastUser, useHeyYumi);
          cards = found; // 마지막 검색 결과를 카드로 보여준다
          return { type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(raw).slice(0, 60000) };
        } catch (err) {
          return { type: "tool_result", tool_use_id: tu.id, content: String(err.message || err), is_error: true };
        }
      }),
    );
    messages.push({ role: "user", content: results });
  }
  return { text: "검색이 길어지고 있어요. 조건을 조금 좁혀서 다시 물어봐 주세요.", cards };
}
