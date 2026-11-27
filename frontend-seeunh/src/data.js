// 피그마 프로토타입(어디가게 앱)과 같은 샘플 데이터. 실제 가게 정보가 아닙니다.
const img = name => `${import.meta.env.BASE_URL}food/${name}.jpg`

export const PLACES = [
  { id: 1, name: '청춘 김밥', cat: '한식 · 분식', short: '한식', price: '4,500원', walk: 3, eat: 10, img: img('kimbap'), reason: '가장 가깝고 저렴', status: '영업 중', tags: ['#혼밥', '#빠른회전'], hours: '10:00 – 21:00', desc: '정문 바로 앞 김밥집이에요. 주문하면 3분 안에 나와서 공강 30분에도 여유 있게 먹고 올 수 있어요.', menu: [['참치 김밥', '4,500원'], ['라볶이', '6,000원'], ['김치볶음밥', '6,500원']] },
  { id: 2, name: '모모 우동', cat: '일식 · 우동', short: '일식', price: '7,500원', walk: 6, eat: 20, img: img('udon'), reason: '국물 · 혼밥 좌석', status: '영업 중', tags: ['#국물', '#혼밥'], hours: '11:00 – 21:00', desc: '직접 뽑은 면으로 우동을 내는 집이에요. 1인 좌석이 많아 혼자 와도 편해요.', menu: [['모모 우동', '7,500원'], ['새우튀김 우동', '9,000원'], ['유부초밥', '4,000원']] },
  { id: 3, name: '광운 돌솥식당', cat: '한식 · 돌솥', short: '한식', price: '8,500원', walk: 4, eat: 25, img: img('dolsot'), reason: '든든한 한 끼', status: '곧 마감', checks: ['혼밥 가능', '단체석 20석', '예약 가능'], tags: ['#든든', '#혼밥'], hours: '11:00 – 21:00 · 15:00–17:00 브레이크타임', desc: '정문 앞 골목에서 돌솥밥을 짓는 집이에요. 주문 후 8분이면 나와 공강에도 넉넉하고, 혼밥 바 좌석이 있어 혼자 와도 편해요.', menu: [['돌솥비빔밥', '8,500원'], ['된장찌개 정식', '7,500원'], ['제육덮밥', '8,000원']] },
  { id: 4, name: '골목덮밥', cat: '일식 · 덮밥', short: '일식', price: '7,000–11,000원', walk: 4, eat: 13, img: img('golmok'), reason: '회전이 빨라요', status: '영업 중', tags: ['#혼밥', '#빠른회전'], hours: '11:00 – 20:30', desc: '불맛 나는 덮밥을 빠르게 내는 집이에요. 바 좌석 위주라 혼밥하기 좋아요.', menu: [['부타동', '9,000원'], ['규동', '8,500원'], ['가라아게동', '9,500원']] },
  { id: 5, name: '할머니순대국', cat: '한식 · 국물', short: '한식', price: '8,000–10,000원', walk: 6, eat: 15, img: img('sundae'), reason: '든든한 국밥', status: '영업 중', tags: ['#국밥', '#든든'], hours: '08:00 – 22:00', desc: '30년 된 순대국집이에요. 국밥이 바로 나와서 공강에도 든든하게 먹을 수 있어요.', menu: [['순대국', '9,000원'], ['머리국밥', '9,000원'], ['순대 모둠', '10,000원']] },
  { id: 6, name: '회덮밥 상회', cat: '일식 · 회덮밥', short: '일식', price: '9,000–12,000원', walk: 5, eat: 14, img: img('hoe'), reason: '가성비 회덮밥', status: '영업 중', tags: ['#가성비', '#혼밥'], hours: '11:00 – 21:00', desc: '그날 들어온 생선으로 회덮밥을 만드는 집이에요.', menu: [['회덮밥', '11,000원'], ['연어덮밥', '12,000원'], ['알밥', '9,000원']] },
  { id: 7, name: '카페 온도', cat: '카페 · 디저트', short: '카페', price: '3,800원~', walk: 5, eat: 50, img: img('cafe'), reason: '조용한 카공', status: '영업 중', tags: ['#카공', '#디저트'], hours: '09:00 – 22:00', desc: '창가 자리가 넓은 카페예요. 공강에 과제하기 좋아요.', menu: [['아메리카노', '3,800원'], ['카페라테', '4,500원'], ['바스크 치즈케이크', '6,000원']] },
  { id: 8, name: '장수국수', cat: '국수', short: '국수', price: '8,500원~', walk: 7, eat: 40, img: img('guksu'), reason: '단골 많은 곳', status: '영업 중', tags: ['#가성비', '#혼밥'], hours: '평일 10:00 – 21:00 · 라스트오더 20:30', desc: '광운대역 쪽 단골 많은 국숫집이에요. 얼큰 칼국수가 대표 메뉴예요.', menu: [['얼큰 칼국수', '8,500원'], ['김밥', '4,500원'], ['비빔국수', '8,000원']] },
  { id: 9, name: '영축산 정육식당', cat: '정육식당 · 고기', short: '고기', price: '1인 2만 원대', walk: 4, eat: 90, img: img('jeongyuk'), reason: '넓은 공간', status: '영업 중', max: 40, group: true, tags: ['#회식', '#주차가능'], hours: '매일 12:00 – 24:00 · 매장 주차 가능', desc: '단체 이용이 확인된 정육식당이에요. 넓은 홀이 있어 개강총회 같은 모임에 좋아요.', menu: [['돼지갈비 800g', '37,000원'], ['뒷고기 600g', '26,000원'], ['된장찌개', '3,000원']] },
  { id: 10, name: '모퉁이 파스타', cat: '양식 · 파스타', short: '양식', price: '1인 15,000원', walk: 9, eat: 60, img: img('pasta'), reason: '분위기 좋은 단체석', status: '영업 중', max: 24, group: true, tags: ['#단체석', '#분위기'], hours: '11:30 – 22:00', desc: '분위기 좋은 파스타집이에요. 24명까지 단체석을 쓸 수 있어요.', menu: [['크림 파스타', '14,000원'], ['토마토 리조또', '15,000원'], ['마르게리타 피자', '17,000원']] },
  { id: 11, name: '화로 한상', cat: '고기 · 단체석', short: '고기', price: '1인 18,000원', walk: 8, eat: 90, img: img('jeongyuk'), reason: '단체 예약 가능', status: '영업 중', max: 30, group: true, tags: ['#단체석', '#예약가능'], hours: '16:00 – 24:00', desc: '30명까지 들어가는 단체석이 있는 고깃집이에요.', menu: [['모둠 한상', '18,000원'], ['삼겹살', '15,000원'], ['냉면', '7,000원']] },
  { id: 12, name: '둥지 고기집', cat: '고기', short: '고기', price: '1인 19,000원', walk: 9, eat: 90, img: img('jeongyuk'), reason: '넓은 홀', status: '영업 중', max: 40, group: true, tags: ['#회식', '#단체석'], hours: '16:00 – 24:00', desc: '40명까지 받을 수 있는 넓은 홀이 있어요.', menu: [['한우 모둠', '19,000원'], ['목살', '15,000원'], ['된장밥', '4,000원']] },
]
export const byId = id => PLACES.find(p => p.id === id)

// 건물 → 정문까지 도보 시간(분). 샘플 추정값이며 실제 측정 전입니다.
export const BUILDINGS = [
  { name: '새빛관', gate: 2 }, { name: '옥의관', gate: 3 }, { name: '80주년기념관', gate: 3 }, { name: '중앙도서관', gate: 3 },
  { name: '참빛관', gate: 4 }, { name: '화도관', gate: 4 }, { name: '한울관', gate: 5 }, { name: '연구관', gate: 5 },
  { name: '비마관', gate: 6 }, { name: '누리관', gate: 7 },
]
export const gateOf = name => BUILDINGS.find(b => b.name === name)?.gate ?? 5
// 지금 건물 → 정문 → 가게 → (식사) → 가게 → 정문 → 다음 수업 건물
export const tripOf = (p, from, to) => gateOf(from) + p.walk * 2 + p.eat + gateOf(to)

export const SOLO_ORDER = [4, 5, 6, 1, 2, 3, 8, 7]
export const SOLO_KEYWORDS = ['#회전빠름', '#1인석있음', '#분식가능', '#가성비', '#혼밥', '#단체석', '#카공']
export const GROUP_KEYWORDS = ['#단체석', '#회식', '#개강총회', '#예약가능', '#주차가능', '#룸있음', '#1인 2만원']

export const ROUTES = {
  8: { m: 7, dist: '350m', arrive: '12:59', close: '21:00', back: '먹고 바로 나오면 13:40 복귀 · 수업 20분 전', steps: [['정문에서 나와 왼쪽으로', '40m'], ['광운로 따라 직진', '250m'], ['편의점 끼고 오른쪽 골목', '60m']] },
  7: { m: 5, dist: '260m', arrive: '12:57', close: '22:00', back: '50분 머물고 나오면 13:55 복귀 · 수업 5분 전', steps: [['정문에서 나와 왼쪽으로', '40m'], ['광운로 따라 직진', '150m'], ['사거리에서 오른쪽', '70m']] },
}

export const INITIAL_RESERVATIONS = [
  { id: 'r1', placeId: 11, date: '11월 12일 (목)', short: '11/12(목)', time: '오후 7:00', clock: '19:00', people: 25, state: 'pending' },
  { id: 'r2', placeId: 9, date: '11월 13일 (금)', short: '11/13(금)', time: '오후 7:00', clock: '19:00', people: 25, state: 'confirmed' },
  { id: 'r3', placeId: 2, date: '11월 9일 (월)', short: '11/9(월)', time: '오후 12:30', clock: '12:30', people: 4, state: 'pending' },
  { id: 'r4', placeId: 1, date: '11월 4일 (수)', short: '11/4(수)', time: '오후 1:10', clock: '13:10', people: 1, state: 'done' },
]

export const STATE_LABEL = { pending: '확인 대기', confirmed: '예약 확정', rejected: '예약 거절', done: '이용 완료' }
