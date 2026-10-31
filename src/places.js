// 사용자 문장 → 조건(공강·인원·예산) 파싱, 가게 카드 변환, 샘플 데이터.
import { callTool } from "./heyyumi.js";

const WALK_M_PER_MIN = 70;
export const AREA = "광운대역";

export function parseConditions(text) {
  const t = text.replace(/\s+/g, " ");
  const c = { gapMin: null, people: null, budget: null, purpose: "meal", raw: text };

  const h = t.match(/(\d+(?:\.\d+)?)\s*시간(?:\s*(\d+)\s*분)?/);
  const m = t.match(/(\d+)\s*분/);
  if (h) c.gapMin = Math.round(parseFloat(h[1]) * 60) + (h[2] ? Number(h[2]) : 0);
  else if (m) c.gapMin = Number(m[1]);
  else if (/한\s*시간/.test(t)) c.gapMin = 60;
  else if (/두\s*시간/.test(t)) c.gapMin = 120;

  const p = t.match(/(\d+)\s*(?:명|인)/);
  if (p) c.people = Number(p[1]);
  else if (/혼밥|혼자|혼술/.test(t)) c.people = 1;

  const man = t.match(/(\d+(?:\.\d+)?)\s*만\s*원?/);
  const won = t.match(/(\d{3,6})\s*원/);
  const cheon = t.match(/(\d+)\s*천\s*원?/);
  if (/만\s*원\s*(?:이하|안|아래|안쪽|대)/.test(t) && !man) c.budget = 10000;
  else if (man) c.budget = Math.round(parseFloat(man[1]) * 10000);
  else if (cheon) c.budget = Number(cheon[1]) * 1000;
  else if (won) c.budget = Number(won[1]);

  if (/카공|카페|공부|커피/.test(t)) c.purpose = "cafe";
  else if (/개총|개강총회|종강|회식|단체|뒤풀이|MT/.test(t) || (c.people ?? 0) >= 6) c.purpose = "group";
  else if (/술|맥주|한잔|포차/.test(t)) c.purpose = "drink";
  return c;
}

// 공강 시간 안에 왕복 + 식사가 되는 최대 편도 도보 시간(분)
export function maxWalkMinutes(c) {
  if (!c.gapMin) return null;
  const stay = c.purpose === "cafe" ? Math.min(60, c.gapMin / 2) : 35;
  return Math.max(3, Math.floor((c.gapMin - stay - 5) / 2));
}

export function toCard(p, extra = {}) {
  const distanceM = p.distanceM ?? null;
  return {
    id: String(p.id),
    name: p.name,
    category: p.categoryLabel || p.category || "",
    distanceM,
    walkMin: distanceM != null ? Math.max(1, Math.round(distanceM / WALK_M_PER_MIN)) : null,
    address: p.address?.road || p.address || "",
    placeUrl: p.placeUrl || null,
    canReserve: Boolean(p.yumiBooking?.canRequest || p.yumiReservable),
    partner: Boolean(p.yumiReservable),
    menu: p.menuPreview || p.matchedMenu || null,
    hours: p.hoursText || null,
    tags: p.tags || [],
    demo: Boolean(p.demo),
    ...extra,
  };
}

// HeyYumi search_places 인자를 조건에서 만든다
export function searchArgs(c) {
  const args = { region_name: AREA, page_size: 6, open_at: "now", fields: "quality" };
  if (c.purpose === "cafe") args.business_category = "cafe";
  else if (c.purpose === "drink") args.business_category = "bar";
  else args.business_category = "restaurant";
  if (c.purpose === "group") {
    args.group_friendly = "true";
    args.reservation_channel = "yumi";
    delete args.open_at;
  }
  if (c.people === 1 && c.purpose === "meal") args.recommended_for = "solo_dining";
  if (c.budget && c.purpose !== "group") args.max_dish_price = c.budget;
  else if (/가성비|싼|저렴/.test(c.raw)) args.good_value = "true";
  if (c.purpose === "cafe") args.power_outlets = "true";
  return args;
}

export async function searchHeyYumi(c) {
  const res = await callTool("search_places", searchArgs(c));
  return (res.data || []).map((p) => toCard(p));
}

// ── 데모용 샘플 데이터 ──────────────────────────────
// 일부는 기획서 프로토타입 화면의 예시, 일부는 2026-10-31 HeyYumi 검색 결과(광운대역 주변)를 옮겨 둔 것.
// 메뉴·영업시간은 예시이므로 실제와 다를 수 있다.
const SAMPLE = [
  {
    id: "demo-jangsu", name: "장수국수", categoryLabel: "국수", distanceM: 490, demo: true,
    menuPreview: "얼큰 칼국수 8,500원 · 김밥 4,500원", hoursText: "평일 10:00–21:00 · 라스트오더 20:30",
    tags: ["단골 많은 곳", "가성비", "혼밥"], minPrice: 4500, purposes: ["meal"],
  },
  {
    id: "demo-mindle", name: "민들레 국시", categoryLabel: "국수", distanceM: 35, demo: true,
    menuPreview: "멸치국수 7,000원 · 비빔국수 7,500원", hoursText: "평일 11:00–20:00",
    tags: ["가까운 곳", "혼밥"], minPrice: 7000, purposes: ["meal"],
  },
  {
    id: "628214370", name: "백채김치찌개 공릉역점", categoryLabel: "찌개,전골", distanceM: 880,
    placeUrl: "https://heyyumi.ai/en/places/628214370", yumiBooking: { canRequest: true }, demo: true,
    menuPreview: "김치찌개 (가격은 매장 확인)", tags: ["혼밥", "가성비"], minPrice: 9000, purposes: ["meal"],
  },
  {
    id: "1182069100", name: "뜨락", categoryLabel: "한식", distanceM: 885,
    placeUrl: "https://heyyumi.ai/en/places/1182069100", yumiBooking: { canRequest: true }, demo: true,
    tags: ["가성비"], minPrice: 9000, purposes: ["meal", "group"],
  },
  {
    id: "demo-youngchuk", name: "영축산 정육식당", categoryLabel: "정육식당", distanceM: 280, demo: true,
    yumiBooking: { canRequest: true },
    menuPreview: "돼지갈비 800g 37,000원 · 뒷고기 600g 26,000원", hoursText: "매일 12:00–24:00 · 매장 주차 가능",
    tags: ["단체 추천", "넓은 공간"], minPrice: 26000, purposes: ["group"],
  },
  {
    id: "36771841", name: "동창야채닭갈비 공릉점", categoryLabel: "닭갈비", distanceM: 884,
    placeUrl: "https://heyyumi.ai/en/places/36771841", yumiBooking: { canRequest: true }, demo: true,
    tags: ["단체 가능"], minPrice: 13000, purposes: ["group", "meal"],
  },
  {
    id: "1103410692", name: "참치여라", categoryLabel: "생선회", distanceM: 965,
    placeUrl: "https://heyyumi.ai/en/places/1103410692", yumiBooking: { canRequest: true }, demo: true,
    tags: ["단체 가능"], minPrice: 30000, purposes: ["group", "drink"],
  },
  {
    id: "demo-cafe", name: "공릉 스터디카페 (예시)", categoryLabel: "카페", distanceM: 320, demo: true,
    menuPreview: "아메리카노 3,000원", hoursText: "매일 09:00–23:00", tags: ["콘센트", "카공"],
    minPrice: 3000, purposes: ["cafe"],
  },
];

export function searchDemo(c) {
  const maxWalk = maxWalkMinutes(c);
  let list = SAMPLE.filter((p) => p.purposes.includes(c.purpose === "drink" ? "drink" : c.purpose));
  if (c.budget && c.purpose !== "group") list = list.filter((p) => p.minPrice <= c.budget);
  let cards = list.map((p) => toCard(p));
  if (maxWalk) {
    const near = cards.filter((x) => x.walkMin <= maxWalk);
    cards = near.length ? near : cards.slice(0, 2).map((x) => ({ ...x, tags: [...x.tags, "공강 안에 빠듯해요"] }));
  }
  return cards.sort((a, b) => a.distanceM - b.distanceM).slice(0, 4);
}

export function describeConditions(c) {
  const parts = [];
  if (c.gapMin) parts.push(`공강 ${c.gapMin >= 60 ? `${Math.floor(c.gapMin / 60)}시간${c.gapMin % 60 ? ` ${c.gapMin % 60}분` : ""}` : `${c.gapMin}분`}`);
  if (c.people) parts.push(c.people === 1 ? "혼자" : `${c.people}명`);
  if (c.budget) parts.push(`${c.budget.toLocaleString()}원 이하`);
  parts.push({ meal: "식사", cafe: "카공", group: "단체", drink: "술자리" }[c.purpose]);
  return parts.join(" · ");
}
