import { useState } from 'react'
import './App.css'
import Icon from './Icon.jsx'
import { PLACES, byId, BUILDINGS, gateOf, tripOf, SOLO_ORDER, SOLO_KEYWORDS, GROUP_KEYWORDS, ROUTES, INITIAL_RESERVATIONS, STATE_LABEL } from './data.js'

const VOTE_LINK = 'https://eodigage.app/vote/kw1119' // 시연용 가짜 링크
const NAV = [{ id: 'home', icon: 'nav', label: '홈' }, { id: 'map', icon: 'map', label: '지도' }, { id: 'chat', icon: 'spark', label: 'AI 추천' }, { id: 'my', icon: 'user', label: '마이' }]
const NAV_OF = { home: 'home', vote: 'home', detail: 'home', map: 'map', chat: 'chat', compare: 'chat', my: 'my', reservations: 'my', favorites: 'my', visits: 'my' }
const addMin = (hhmm, m) => { const [h, mm] = hhmm.split(':').map(Number); const t = h * 60 + mm + m; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}` }
const fmtDate = iso => { const d = new Date(iso + 'T00:00'); return `${d.getMonth() + 1}월 ${d.getDate()}일 (${'일월화수목금토'[d.getDay()]})` }
const fmtTime = hm => { const [h, m] = hm.split(':').map(Number); return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(m).padStart(2, '0')}` }

function StatusBar({ light }) {
  return <div className={'statusbar' + (light ? ' light' : '')}><b>9:41</b><span className="sb-icons">
    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4 10.4 10.4 0 0 0 .8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.7 6.7 0 0 0 8 4a6.7 6.7 0 0 0-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.6l1.3-1.7c-.3-.3-.8-.5-1.3-.5Z" /></svg>
    <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".45" /><rect x="2.5" y="2.5" width="18" height="7" rx="1.5" /><rect x="23.6" y="4" width="1.6" height="4" rx=".8" opacity=".45" /></svg>
  </span></div>
}

export default function App() {
  const [page, setPage] = useState('home')
  const [history, setHistory] = useState([])
  const [mode, setMode] = useState('solo')
  const [minutes, setMinutes] = useState(60)
  const [budget, setBudget] = useState('2만 원')
  const [people, setPeople] = useState(25)
  const [selectedId, setSelectedId] = useState(3)
  const [liked, setLiked] = useState([3, 2, 7, 11])
  const [chat, setChat] = useState([])
  const [message, setMessage] = useState('')
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS)
  const [currentRes, setCurrentRes] = useState('r1')
  const [bookDate, setBookDate] = useState('2026-11-12')
  const [bookTime, setBookTime] = useState('19:00')
  const [note, setNote] = useState('단체석으로 부탁드려요. 알레르기가 있는 인원이 있어요.')
  const [search, setSearch] = useState('')
  const [resTab, setResTab] = useState('pending')
  const [mapSel, setMapSel] = useState(8)
  const [mapFilter, setMapFilter] = useState('밥')
  const [fromB, setFromB] = useState('새빛관')
  const [toB, setToB] = useState('비마관')
  const [sheet, setSheet] = useState(null)
  const [voteStage, setVoteStage] = useState('setup')
  const [voteIds, setVoteIds] = useState([4, 1, 5])
  const [votes, setVotes] = useState({})
  const [myVote, setMyVote] = useState(null)
  const [prefs, setPrefs] = useState({ cats: ['한식', '일식', '카페'], budget: '1만 원 이하', alarm: true, news: false })
  const [toast, setToast] = useState('')

  const place = byId(selectedId) || PLACES[0]
  const res = reservations.find(r => r.id === currentRes) || reservations[0]
  const trip = p => tripOf(p, fromB, toB)
  const feasible = SOLO_ORDER.map(byId).filter(p => trip(p) <= minutes)
  const groups = [9, 10, 11, 12].map(byId)
  const fitGroups = groups.filter(p => p.max >= people)
  const top3 = (feasible.length >= 3 ? feasible : SOLO_ORDER.map(byId)).filter(p => [1, 2, 3].includes(p.id)).concat(feasible).filter((p, i, a) => a.indexOf(p) === i).slice(0, 3)
  const showToast = t => { setToast(t); setTimeout(() => setToast(''), 1800) }

  const go = (next, id) => { if (id != null) setSelectedId(id); setHistory(h => [...h, page]); setPage(next); window.scrollTo(0, 0) }
  const back = () => { if (history.length) { setPage(history[history.length - 1]); setHistory(history.slice(0, -1)) } else setPage('home'); window.scrollTo(0, 0) }
  const navigate = next => { setHistory([]); setPage(next); window.scrollTo(0, 0) }
  const toggleLike = id => setLiked(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id])
  const share = text => { navigator.clipboard?.writeText(text).catch(() => {}); showToast('링크를 복사했어요. 단톡방에 붙여 넣으세요') }

  // ---------- AI 채팅 (시연용 스크립트) ----------
  const botReply = text => {
    if (/예약/.test(text)) {
      const target = PLACES.find(p => text.includes(p.name)) || (mode === 'group' ? byId(9) : byId(3))
      return { role: 'bot', text: '네, 바로 예약 요청을 보낼 수 있어요. 가게가 5분 안에 답하고, 수락 전까지는 ‘요청’ 상태예요.', action: { label: '예약 요청하기', id: target.id } }
    }
    if (/단체|명|개총|회식/.test(text)) return { role: 'bot', text: `단체 이용이 확인된 곳이에요. 1인 ${budget === '상관없음' ? '2만 원' : budget}대로 예상돼요.`, card: 9 }
    if (/국수|1시간|길안내/.test(text)) return { role: 'bot', text: '지금 문 열었고, 갔다 오기 부담 없는 곳이에요.', card: 8 }
    return { role: 'bot', text: `도보 10분 안, 지금 영업 중인 ${top3.length}곳을 골랐어요.`, list: top3.map(p => p.id) }
  }
  const greeting = () => ({ role: 'bot', text: mode === 'solo' ? `안녕하세요! 공강 ${minutes}분 기준으로 찾아볼게요. 오늘은 어떤 게 당기세요?` : `안녕하세요! ${people}명 단체 모임 기준으로 찾아볼게요. 어떤 자리가 필요하세요?` })
  const sendMessage = (text = message, fresh = false) => {
    if (!text.trim()) return
    setChat(c => [...(fresh || !c.length ? [greeting()] : c), { role: 'user', text }, botReply(text)])
    setMessage('')
  }
  const openChat = () => { if (!chat.length) setChat([greeting()]); go('chat') }

  // ---------- 예약 ----------
  const requestBooking = () => {
    const id = 'r' + Date.now()
    const d = new Date(bookDate + 'T00:00')
    setReservations(r => [{ id, placeId: place.id, date: fmtDate(bookDate), short: `${d.getMonth() + 1}/${d.getDate()}(${'일월화수목금토'[d.getDay()]})`, time: fmtTime(bookTime), clock: bookTime, people, state: 'pending' }, ...r])
    setCurrentRes(id); go('bookingStatus')
  }
  const setResState = state => setReservations(r => r.map(x => x.id === res.id ? { ...x, state } : x))

  // ---------- 투표방 ----------
  const startVote = () => { const seed = {}; voteIds.forEach((id, i) => { seed[id] = [2, 1, 0][i] ?? 0 }); setVotes(seed); setMyVote(null); setVoteStage('live') }
  const castVote = id => { setVotes(v => { const n = { ...v }; if (myVote != null) n[myVote] -= 1; n[id] = (n[id] || 0) + 1; return n }); setMyVote(id) }

  // ---------- 공통 UI ----------
  const Header = ({ title, right = '샘플 데이터' }) => <header className="top-header"><button className="round-btn" onClick={back} aria-label="뒤로 가기"><Icon n="back" s={20} sw={2.4} /></button><strong>{title}</strong>{right && <small>{right}</small>}</header>
  const TabBar = () => <nav className="tabbar">{NAV.map(n => <button key={n.id} className={NAV_OF[page] === n.id ? 'on' : ''} onClick={() => n.id === 'chat' ? (setHistory([]), openChat()) : navigate(n.id)}><Icon n={n.icon} s={22} sw={1.8} /><span>{n.label}</span></button>)}</nav>
  const Heart = ({ id, size = 22, className = '' }) => <button className={'heart-btn ' + className + (liked.includes(id) ? ' on' : '')} onClick={e => { e.stopPropagation(); toggleLike(id) }} aria-label="찜하기"><Icon n="heart" s={size} fill={liked.includes(id) ? 'currentColor' : 'none'} /></button>
  const Thumb = ({ p, size = 76 }) => <img className="thumb" src={p.img} alt="" style={{ width: size, height: size }} />
  const ListCard = ({ p, meta, price, onClick }) => <div role="button" tabIndex={0} className="list-card" onClick={onClick || (() => go('detail', p.id))}><Thumb p={p} /><span className="lc-body"><b>{p.name}</b><small>{meta || `${p.short} · 도보 ${p.walk}분`}</small><strong>{price || p.price}</strong></span><Heart id={p.id} /></div>
  const Pill = ({ state }) => <span className={'pill ' + state}>{STATE_LABEL[state]}</span>

  const PickCard = ({ p }) => <div role="button" tabIndex={0} className="pick-card" onClick={() => go('detail', p.id)}>
    <span className="pick-photo" style={{ backgroundImage: `url(${p.img})` }}><span className="badge-dark">{mode === 'solo' ? `총 ${trip(p)}분` : `최대 ${p.max}명`}</span><Heart id={p.id} size={18} className="photo-heart" /></span>
    <span className="pick-body"><small className="orange">{p.cat}</small><b>{p.name}</b><span className="hash">{p.tags.map(t => <i key={t}>{t}</i>)}</span><span className="pick-meta">도보 {p.walk}분 · <em>{p.price}</em></span></span>
  </div>

  const screens = {
    // ================= 01 홈 =================
    home: () => <>
      <div className="home-top">
        <StatusBar />
        <div className="home-heading">
          <div className="eyebrow">오늘도 맛있는 한 끼</div>
          <div className="brand-row"><h1>광운대 어디가게</h1><button className="vote-chip" onClick={() => go('vote')}><Icon n="thumb" s={15} sw={2.2} />투표방</button></div>
          <label className="searchbox"><Icon n="search" s={19} sw={2.2} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="식당, 메뉴를 검색해 보세요" /></label>
        </div>
      </div>
      <main className="scroll gray">
        <section className="planner">
          <div className="seg"><button className={mode === 'solo' ? 'on' : ''} onClick={() => setMode('solo')}><Icon n="clock" s={16} sw={2.2} />공강 식사</button><button className={mode === 'group' ? 'on' : ''} onClick={() => setMode('group')}><Icon n="users" s={16} sw={2.2} />단체 모임</button></div>
          <div className="field-row">
            <button className="field" onClick={() => setSheet(mode === 'solo' ? 'from' : 'date')}><span>{mode === 'solo' ? '지금 여기서' : '모임 날짜'}</span><b><Icon n="pin" s={16} sw={2.4} className="orange" />{mode === 'solo' ? fromB : fmtDate(bookDate)}{mode === 'solo' && <Icon n="down" s={16} className="caret" />}</b></button>
            <Icon n="right" s={16} className="field-arrow" />
            <button className="field" onClick={() => setSheet(mode === 'solo' ? 'to' : 'people')}><span>{mode === 'solo' ? '다음 수업은' : '인원'}</span><b><Icon n="pin" s={16} sw={2.4} className="orange" />{mode === 'solo' ? toB : `${people}명`}<Icon n="down" s={16} className="caret" /></b></button>
          </div>
          <div className="between"><span>{mode === 'solo' ? '공강 시간' : '1인 예산'}</span><b className="orange">{mode === 'solo' ? `${minutes}분` : budget}</b></div>
          <div className="opts">{(mode === 'solo' ? [30, 45, 60, 120] : ['1만 원', '2만 원', '3만 원', '상관없음']).map(v => <button key={v} className={(mode === 'solo' ? minutes === v : budget === v) ? 'on' : ''} onClick={() => mode === 'solo' ? setMinutes(v) : setBudget(v)}>{mode === 'solo' ? `${v}분` : v}</button>)}</div>
          <button className="btn primary" onClick={() => { setChat([]); sendMessage(mode === 'solo' ? '혼자 빨리 먹을 수 있는 곳 추천해줘' : `다음 주 목요일 저녁 7시, ${people}명 개총할 곳 찾아줘`, true); go('chat') }}>
            {mode === 'solo' ? `${minutes}분 안에 다녀올 ${feasible.length}곳` : `${people}명 단체석 있는 ${fitGroups.length}곳`}<Icon n="right" s={16} sw={2.6} />
          </button>
        </section>
        {search ? <section className="sec"><div className="sec-head"><h2>‘{search}’ 검색 결과</h2></div><div className="stack">{PLACES.filter(p => (p.name + p.cat + p.tags.join()).includes(search)).map(p => <ListCard key={p.id} p={p} />)}</div></section> : <>
          <section className="sec">
            <div className="kicker">{mode === 'solo' ? 'SMART PICK' : 'GROUP PICK'}</div>
            <div className="sec-head"><h2>{mode === 'solo' ? '지금 딱 맞는 식당' : '단체로 가기 좋은 곳'}</h2><button onClick={() => { setChat([]); sendMessage(mode === 'solo' ? '혼자 빨리 먹을 수 있는 곳 추천해줘' : `${people}명 단체로 갈 곳 찾아줘`, true); go('chat') }}>전체보기</button></div>
            <div className="hscroll">{(mode === 'solo' ? feasible : groups.slice(0, 3)).map(p => <PickCard key={p.id} p={p} />)}</div>
            {mode === 'solo' && !feasible.length && <p className="empty-note">{fromB} → {toB} 이동까지 생각하면 {minutes}분 안에 다녀올 곳이 없어요. 공강 시간을 늘려 보세요.</p>}
          </section>
          <section className="sec">
            <div className="kicker gray-k">{mode === 'solo' ? '지금 많이 찾는' : '단체 모임에서 많이 찾는'}</div>
            <div className="sec-head"><h2>인기 키워드</h2></div>
            <div className="chips">{(mode === 'solo' ? SOLO_KEYWORDS : GROUP_KEYWORDS).map(k => <button key={k} onClick={() => setSearch(k.replace('#', '').split(' ')[0])}>{k}</button>)}</div>
          </section>
          <section className="sec"><button className="curation" onClick={() => go('detail', 4)}><span><small>어디가게 큐레이션</small><b>선배들만 아는<br />광운대 숨은 맛집</b></span><img src={byId(4).img} alt="" /></button></section>
        </>}
      </main>
      <TabBar />
    </>,

    // ================= 02 AI 채팅 =================
    chat: () => <>
      <StatusBar /><Header title="AI 추천" />
      <div className="ctx-chip"><Icon n="clock" s={15} sw={2.2} className="orange" />{mode === 'solo' ? `공강 ${minutes}분 · ${fromB} → ${toB} · 1만 원 이하` : `다음 주 목요일 19:00 · ${people}명 · 단체`}</div>
      <main className="scroll gray chat-body">
        {chat.map((m, i) => <div key={i} className={'msg ' + m.role}>
          {m.role === 'bot' && <span className="bot-ava"><Icon n="spark" s={16} fill="currentColor" sw={1} /></span>}
          <div className="bubble">
            {m.text}
            {m.list && <div className="mini-list">{m.list.map(id => { const p = byId(id); return <button key={id} onClick={() => go('detail', id)}><Thumb p={p} size={36} /><span><b>{p.name}</b><small>{p.price} · 도보 {p.walk}분</small></span><Icon n="right" s={16} className="muted" /></button> })}<button className="btn soft" onClick={() => go('compare')}>한눈에 비교하기</button></div>}
            {m.card && (() => { const p = byId(m.card); return <div className="chat-card"><small className="kick">{p.group ? '단체 추천 · 넓은 공간' : '단골 많은 곳 · 가성비'}</small><div className="cc-row"><Thumb p={p} size={52} /><span><b>{p.name} <em className="pill confirmed">영업 중</em></b><small>{p.cat} · 광운대역 도보 {p.walk}분</small></span></div><p>{p.menu.slice(0, 2).map(x => x.join(' ')).join(' · ')}</p><p className="muted">{p.hours}</p>{p.group ? <button className="btn primary sm" onClick={() => go('booking', p.id)}>예약 요청 보내기</button> : <button className="btn primary sm" onClick={() => go('guide', p.id)}>{p.name} 길안내 보기</button>}</div> })()}
            {m.action && <button className="btn primary sm" onClick={() => go('booking', m.action.id)}>{m.action.label}</button>}
          </div>
        </div>)}
        {chat.length <= 1 && <div className="suggest">{['혼자 빨리 먹을 수 있는 곳 추천해줘', '공강 1시간, 국수 먹고 싶어', '25명 개총할 곳 찾아줘', '광운 돌솥식당 예약도 돼?'].map(s => <button key={s} onClick={() => sendMessage(s)}>{s}</button>)}</div>}
      </main>
      <div className="composer"><div><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && sendMessage()} placeholder="원하는 조건을 말해 보세요" /><button onClick={() => sendMessage()} aria-label="보내기"><Icon n="send" s={18} sw={2.2} /></button></div><small>HeyYumi 검증 가게 데이터 기반 추천 · 샘플 대화</small></div>
      <TabBar />
    </>,

    // ================= 03 추천 결과 비교 =================
    compare: () => <>
      <StatusBar /><Header title="추천 결과 비교" />
      <main className="scroll gray compare">
        <div className="cmp-grid"><span />{top3.map((p, i) => <div key={p.id} className={'cmp-head' + (i === 0 ? ' first' : '')}>{i === 0 && <em className="rank">1순위</em>}<Thumb p={p} size={62} /><b>{p.name}</b><Heart id={p.id} size={18} /></div>)}</div>
        {[['대표 메뉴', p => p.price.replace('~', '').split('–')[0]], ['도보 거리', p => `${p.walk}분`], ['왕복 소요', p => `약 ${p.walk * 2}분`], ['영업 상태', p => <span className={p.status === '곧 마감' ? 'red' : 'green'}>{p.status}</span>], ['추천 이유', p => <small>{p.reason}</small>]].map(([label, f]) => <div className="cmp-grid row" key={label}><span>{label}</span>{top3.map(p => <b key={p.id}>{f(p)}</b>)}</div>)}
        <div className="cmp-grid"><span />{top3.map(p => <button key={p.id} className="btn soft sm" onClick={() => go('detail', p.id)}>상세</button>)}</div>
        <p className="foot">* HeyYumi 검증 데이터 기준 · 샘플 데이터</p>
        <div className="grow" />
        <button className="btn outline" onClick={() => { setChat([greeting()]); go('chat') }}>조건 바꿔서 다시 추천받기</button>
        <button className="btn primary" onClick={() => go('detail', top3[0].id)}>1순위 가게 상세 보기</button>
      </main>
    </>,

    // ================= 04 가게 상세 =================
    detail: () => { const t = trip(place); const left = minutes - t; return <>
      <main className="scroll detail">
        <div className="hero" style={{ backgroundImage: `url(${place.img})` }}>
          <StatusBar light />
          <button className="round-btn white hero-back" onClick={back} aria-label="뒤로 가기"><Icon n="back" s={20} sw={2.4} /></button>
          <div className="hero-actions"><button className="round-btn white" onClick={() => share(`${place.name} · 어디가게`)} aria-label="공유"><Icon n="share" s={18} /></button><Heart id={place.id} className="round-btn white" /></div>
          <div className="hero-title"><span className="tag-or">{place.cat}</span><h1>{place.name}</h1><small><Icon n="pin" s={14} sw={2.4} />정문에서 도보 {place.walk}분 · 노원구 광운로 일대</small></div>
          <em className="ai-note">AI 생성 샘플 이미지</em>
        </div>
        <div className="detail-body">
          <div className="info-row"><Icon n="clock" s={18} className="muted" /><span>{place.hours}</span><em className={'pill ' + (place.status === '곧 마감' ? 'rejected' : 'confirmed')}>{place.status}</em></div>
          <div className="check-tags">{(place.checks || (place.group ? [`단체석 ${place.max}석`, '예약 가능', '회식 가능'] : ['혼밥 가능', '빠른 회전', '예약 가능'])).map(x => <span key={x}>✓ {x}</span>)}</div>
          <div className="eta">
            <div className="eta-head"><b><Icon n="clock" s={16} sw={2.4} className="orange" />공강시간 계산</b><em className={'pill ' + (left >= 0 ? 'confirmed' : 'rejected')}>{left >= 0 ? `${left}분 여유` : `${-left}분 부족`}</em></div>
            <div className="eta-grid"><div><small>출발</small><b>12:00</b></div><div className="mid"><small>식사</small><b>약 {place.eat}분</b></div><div><small>복귀</small><b>{addMin('12:00', t)}</b></div></div>
            <p>왕복 도보 {place.walk * 2}분 · {left >= 0 ? `지금 출발하면 다음 수업 ${left}분 전에 돌아와요` : `${fromB}→${toB} 이동까지 생각하면 공강 시간이 부족해요`}</p>
          </div>
          <div className="kicker">ABOUT</div><h3>이런 곳이에요</h3><p className="desc">{place.desc}</p>
          <div className="kicker">MENU</div><h3>대표 메뉴</h3>
          <div className="menu-list">{place.menu.map(([n, pr], i) => <div key={n}><em>{i + 1}</em><b>{n}</b><strong>{pr}</strong></div>)}</div>
          <button className="share-line" onClick={() => share(`${place.name} · 어디가게`)}><Icon n="arrow" s={15} sw={2.2} />이 정보 단톡방에 공유하기</button>
          <p className="foot">※ 샘플 데이터입니다. 실제 가게 정보가 아니에요.</p>
        </div>
      </main>
      <div className="fixed-actions"><button className="btn soft" onClick={() => { setChat(c => c.length ? c : [greeting()]); sendMessage(`${place.name} 어때?`); go('chat') }}>AI에게 물어보기</button><button className="btn primary" onClick={() => go('booking')}>예약 요청</button></div>
      <TabBar />
    </> },

    // ================= 05 예약 요청 =================
    booking: () => <>
      <StatusBar /><Header title="예약 요청" />
      <main className="scroll gray form">
        <div className="card book-place"><Thumb p={place} /><span className="lc-body"><b>{place.name}</b><small>{place.group ? '단체석' : place.short} · 도보 {place.walk}분{place.max ? ` · 최대 ${place.max}명` : ''}</small><strong>{place.price}</strong></span><Heart id={place.id} /></div>
        <div className="two">
          <label className="card fld"><small>방문 날짜</small><b>{fmtDate(bookDate)}<Icon n="cal" s={18} className="muted" /></b><input type="date" value={bookDate} onChange={e => e.target.value && setBookDate(e.target.value)} /></label>
          <label className="card fld"><small>방문 시간</small><b>{fmtTime(bookTime)}<Icon n="clock" s={18} className="muted" /></b><input type="time" value={bookTime} onChange={e => e.target.value && setBookTime(e.target.value)} /></label>
        </div>
        <div className="card fld"><small>예약 인원</small><div className="counter"><b>{people}명</b><span><button className="c-minus" onClick={() => setPeople(Math.max(1, people - 1))} aria-label="인원 줄이기"><Icon n="minus" s={16} sw={2.6} /></button><button className="c-plus" onClick={() => setPeople(Math.min(60, people + 1))} aria-label="인원 늘리기"><Icon n="plus" s={16} sw={2.6} /></button></span></div></div>
        <div className="card fld"><small>요청자 연락처</small><b>010-1234-5678 (샘플)</b></div>
        <label className="card fld"><small>추가 요청사항</small><textarea rows="2" value={note} onChange={e => setNote(e.target.value)} /></label>
        <div className="notice"><Icon n="clock" s={17} sw={2.2} /><span>음식점이 수락하기 전까지는 예약이 확정되지 않아요.<br />보통 5분 안에 답이 와요.</span></div>
        <div className="grow" />
        <button className="btn primary" onClick={requestBooking}>예약 요청 보내기</button>
      </main>
    </>,

    // ================= 09~11 예약 결과 =================
    bookingStatus: () => { const p = byId(res.placeId); const st = res.state; return <>
      <StatusBar />
      <main className="scroll result">
        <div className={'res-icon ' + st}><Icon n={st === 'confirmed' ? 'check' : st === 'rejected' ? 'x' : 'clock'} s={34} sw={1.8} /></div>
        <h1>{st === 'confirmed' ? '예약이 확정됐어요' : st === 'rejected' ? '예약이 거절됐어요' : '예약을 요청했어요'}</h1>
        <Pill state={st} />
        <p className="muted center">{st === 'confirmed' ? '음식점이 예약을 수락했어요.' : st === 'rejected' ? <>해당 시간엔 자리가 어렵다고 해요.<br />비슷한 조건의 다른 가게를 추천해드릴게요.</> : <>음식점에서 확인하고 있어요.<br />수락되면 알림으로 알려드릴게요.</>}</p>
        {st !== 'rejected' && <div className="summary">{[['음식점', p.name], ['날짜', res.date], ['시간', res.time], ['인원', `${res.people}명`]].map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div>}
        {st === 'pending' && <><p className="small-note">아직 예약이 확정된 것이 아니에요.</p><div className="demo-reply">프로토타입 · 가게 응답: <button className="green" onClick={() => setResState('confirmed')}>수락</button> / <button className="red" onClick={() => setResState('rejected')}>거절</button></div></>}
        {st === 'confirmed' && <><div className="mini-map"><span className="road h" /><span className="road v" /><span className="road v2" /><em className="mm-label"><Icon n="pin" s={13} sw={2.4} />광운대학교</em><em className="mm-pin">1</em></div><p className="addr"><Icon n="pin" s={15} sw={2.2} className="orange" />노원구 광운로 일대 · 정문에서 도보 {p.walk}분</p></>}
        {st === 'rejected' && <><h3 className="left">이런 가게는 어때요?</h3><div className="stack">{[12, 10].map(id => { const q = byId(id); return <ListCard key={id} p={q} meta={`${q.short} · 도보 ${q.walk}분 · 최대 ${q.max}명`} onClick={() => go('booking', id)} /> })}</div></>}
        <div className="grow" />
        {st === 'pending' && <><button className="share-line center" onClick={() => share(`${p.name} 예약 요청 · 어디가게`)}><Icon n="share" s={15} />일행에게 요청 상황 공유하기</button><button className="btn primary" onClick={() => { setResTab('pending'); navigate('reservations') }}>예약 내역 확인</button><button className="btn outline" onClick={() => navigate('home')}>홈으로</button></>}
        {st === 'confirmed' && <><button className="btn primary" onClick={() => { setResTab('confirmed'); navigate('reservations') }}>예약 상세 보기</button><div className="two"><button className="btn outline" onClick={() => share(`${p.name} ${res.date} ${res.time} 예약 확정 · 어디가게`)}>↗ 일행에게 공유</button><button className="btn outline" onClick={() => navigate('home')}>홈으로</button></div></>}
        {st === 'rejected' && <><button className="btn primary" onClick={() => { setChat([]); sendMessage(`${res.people}명 단체로 갈 다른 곳 찾아줘`, true); navigate('chat') }}>다른 음식점 추천받기</button><button className="btn outline" onClick={() => { setResTab('rejected'); navigate('reservations') }}>예약 내역 보기</button></>}
      </main>
    </> },

    // ================= 06 지도 =================
    map: () => { const sel = byId(mapSel); const pins = [{ id: 8, x: 10, y: 33, chosen: '갈 곳', sub: '오늘 공강에 가기로 함' }, { id: 9, x: 47, y: 52, chosen: '예약', sub: '11/13 19:00 · 25명' }, { id: 7, x: 70, y: 28 }, { id: 4, x: 61, y: 36 }, { id: 5, x: 12, y: 52 }, { id: 1, x: 62, y: 22, closed: true }]; return <>
      <main className="map-screen">
        <div className="map-bg"><span className="blk" style={{ left: '8%', top: '18%', width: '18%', height: '9%' }} /><span className="blk" style={{ left: '41%', top: '18%', width: '20%', height: '13%' }} /><span className="blk park" style={{ left: '74%', top: '18%', width: '20%', height: '7%' }} /><span className="blk" style={{ left: '8%', top: '35%', width: '25%', height: '22%' }} /><span className="blk" style={{ left: '41%', top: '35%', width: '20%', height: '22%' }} /><span className="blk" style={{ left: '70%', top: '35%', width: '14%', height: '22%' }} /><span className="road-h" style={{ top: '14%' }} /><span className="road-h" style={{ top: '30%' }} /><span className="road-h" style={{ top: '62%' }} /><span className="road-v" style={{ left: '31%' }} /><span className="road-v" style={{ left: '65%' }} /><span className="road-v thin" style={{ left: '86%' }} /></div>
        <StatusBar />
        <div className="map-search"><input placeholder="이 근처에서 찾기" onFocus={e => e.target.blur()} onClick={openChat} readOnly /><button onClick={openChat} aria-label="찾기"><Icon n="search" s={18} sw={2.4} /></button></div>
        <div className="map-filters">{['지금 영업 중', '밥', '카페', '술'].map(f => <button key={f} className={mapFilter === f ? 'on' : ''} onClick={() => setMapFilter(f)}>{f}</button>)}</div>
        <div className="map-legend"><span><i className="dot or" />내가 고른 곳</span><span><i className="dot ring" />추천</span></div>
        <div className="radius"><em>반경 500m · 도보 7분</em></div>
        <span className="gate-pin"><i />광운대 정문</span>
        {pins.map(pn => { const p = byId(pn.id); return <button key={pn.id} className={'pin' + (pn.chosen ? ' chosen' : '') + (mapSel === pn.id ? ' sel' : '') + (pn.closed ? ' closed' : '')} style={{ left: pn.x + '%', top: pn.y + '%' }} onClick={() => setMapSel(pn.id)}>{pn.chosen && <em>{pn.chosen === '갈 곳' && <Icon n="heart" s={10} fill="currentColor" sw={0} />}{pn.chosen}</em>}<b>{pn.closed ? '준비 중' : p.name}</b>{pn.sub && <small>{pn.sub}</small>}</button> })}
        <div className="map-sheet">
          <span className="handle" />
          <div className="ms-title"><h2>{sel.name}</h2>{[8, 9].includes(sel.id) && <em className="tag-y"><Icon n="heart" s={11} fill="currentColor" sw={0} />{sel.id === 9 ? '예약' : '갈 곳'}</em>}</div>
          <p className="muted">{sel.short} · 도보 {sel.walk}분 · {sel.price}</p>
          <div className="ytags"><span>✓ {sel.status}</span><span>✓ 왕복 {sel.walk * 2}분</span><span>✓ {sel.group ? `최대 ${sel.max}명` : '혼밥 가능'}</span></div>
          <div className="two"><button className="btn outline" onClick={() => go('detail', sel.id)}>가게 상세</button><button className="btn primary" onClick={() => go('guide', sel.id)}>길안내 시작</button></div>
        </div>
      </main>
      <TabBar />
    </> },

    // ================= 07~08 길안내 =================
    guide: () => { const r = ROUTES[place.id] || { m: place.walk, dist: `${place.walk * 50}m`, arrive: addMin('12:52', place.walk), close: '21:00', back: `먹고 바로 나오면 ${addMin('12:00', trip(place))} 복귀 · 수업 ${Math.max(0, minutes - trip(place))}분 전`, steps: [['정문에서 나와 왼쪽으로', '40m'], ['광운로 따라 직진', `${place.walk * 50 - 100}m`], ['골목으로 들어가 오른쪽', '60m']] }; return <>
      <main className="map-screen guide">
        <div className="map-bg"><span className="blk" style={{ left: '8%', top: '18%', width: '18%', height: '9%' }} /><span className="blk" style={{ left: '41%', top: '18%', width: '20%', height: '13%' }} /><span className="blk park" style={{ left: '74%', top: '18%', width: '20%', height: '7%' }} /><span className="blk" style={{ left: '8%', top: '35%', width: '25%', height: '22%' }} /><span className="blk" style={{ left: '41%', top: '35%', width: '20%', height: '22%' }} /><span className="blk" style={{ left: '74%', top: '35%', width: '10%', height: '22%' }} /><span className="road-h" style={{ top: '14%' }} /><span className="road-h" style={{ top: '30%' }} /><span className="road-v" style={{ left: '31%' }} /><span className="road-v" style={{ left: '65%' }} /><span className="road-v thin" style={{ left: '86%' }} /></div>
        <svg className="route" viewBox="0 0 390 460" preserveAspectRatio="none"><path d="M130 330 V250 H150 V175 H112" fill="none" stroke="#ff6a3d" strokeWidth="5" strokeLinejoin="round" /><circle cx="130" cy="330" r="5" fill="#1a1a1a" /></svg>
        <span className="route-dest">{place.name}</span>
        <span className="gate-pin g2"><i className="hide" />광운대 정문</span>
        <StatusBar />
        <div className="guide-bar"><button className="round-btn" onClick={back} aria-label="뒤로 가기"><Icon n="back" s={20} sw={2.4} /></button><Icon n="walk" s={20} className="orange" /><b>{place.name}까지 걸어서 {r.m}분</b></div>
        <div className="map-sheet guide-sheet">
          <span className="handle" />
          <div className="gs-top"><div><h1>{r.m}분</h1><p className="muted">{r.dist} · {r.arrive} 도착 예정</p></div><em className="pill confirmed"><i className="gdot" />영업 중 · {r.close}까지</em></div>
          <div className="return-box">⏱ <b>{r.back}</b></div>
          <ol className="steps">{r.steps.map(([s, d], i) => <li key={s} className={i === 0 ? 'now' : ''}><em>{i + 1}</em><b>{s}</b><small>{d}</small></li>)}</ol>
          <button className="btn primary" onClick={() => { showToast(`${place.name}에 도착했어요. 맛있게 드세요!`); go('detail') }}>도착했어요</button>
        </div>
      </main>
    </> },

    // ================= 12 마이페이지 =================
    my: () => { const week = reservations.filter(r => ['pending', 'confirmed'].includes(r.state)).slice(0, 2); return <>
      <StatusBar />
      <main className="scroll gray my">
        <h1 className="page-title">마이페이지</h1>
        <div className="profile"><span>광</span><div><b>광운 학생</b><small>광운대학교 재학생 · 샘플 계정</small></div></div>
        <div className="stats">{[[reservations.filter(r => r.state !== 'done').length, '예약', 'reservations'], [liked.length, '찜한 가게', 'favorites'], [12, '방문', 'visits']].map(([n, l, to]) => <button key={l} onClick={() => go(to)}><b>{n}</b><span>{l}</span></button>)}</div>
        <div className="card box">
          <div className="sec-head"><h2>이번 주 예약</h2><button onClick={() => go('reservations')}>전체 ›</button></div>
          <div className="week">{[['월', 9], ['화', 10], ['수', 11], ['목', 12], ['금', 13]].map(([d, n]) => <div key={n} className={n === 10 ? 'today' : ''}><small>{d}</small><b>{n}</b>{[12, 13].includes(n) && <i />}</div>)}</div>
          {week.map(r => { const p = byId(r.placeId); return <button className="week-res" key={r.id} onClick={() => { setCurrentRes(r.id); go('bookingStatus') }}><span className="cal-ico"><Icon n="cal" s={18} /></span><span><b>{p.name}</b><small>{r.short} {r.clock} · {r.people}명</small></span><Pill state={r.state} /></button> })}
        </div>
        <div className="card box">
          <div className="sec-head"><h2>내가 쓴 리뷰</h2><button>2개 ›</button></div>
          {[['청춘 김밥', '11월 4일', '공강 30분에도 여유 있게 먹고 왔어요. 김밥 회전이 빨라요!'], ['광운 돌솥식당', '10월 29일', '돌솥비빔밥 든든해요. 혼밥 자리도 넉넉해요.']].map(([n, d, t]) => <div className="review" key={n}><div><b>{n}</b><span className="stars">{[0, 1, 2, 3, 4].map(i => <Icon key={i} n="star" s={13} fill="currentColor" sw={0} />)}</span><small>{d}</small></div><p>{t}</p></div>)}
        </div>
        <div className="card menu-rows">{[['예약 내역', 'reservations'], ['찜한 가게', 'favorites'], ['방문 기록', 'visits'], ['내가 쓴 리뷰', null], ['채팅 기록', 'chat'], ['선호 음식 및 예산 설정', 'visits'], ['알림 설정', 'visits']].map(([l, to]) => <button key={l} onClick={() => to && (to === 'chat' ? openChat() : go(to))}>{l}<Icon n="right" s={16} className="muted" /></button>)}</div>
      </main>
      <TabBar />
    </> },

    // ================= 13 예약 내역 =================
    reservations: () => { const list = reservations.filter(r => r.state === resTab); return <>
      <StatusBar /><Header title="예약 내역" />
      <div className="u-tabs">{[['pending', '예약 요청 중'], ['confirmed', '예약 확정'], ['rejected', '예약 거절'], ['done', '이용 완료']].map(([k, l]) => <button key={k} className={resTab === k ? 'on' : ''} onClick={() => setResTab(k)}>{l}</button>)}</div>
      <main className="scroll gray stack-pad">
        {list.map(r => { const p = byId(r.placeId); return <button className="card res-card" key={r.id} onClick={() => { setCurrentRes(r.id); go('bookingStatus') }}><div className="rc-top"><Thumb p={p} size={56} /><span><b>{p.name}<Pill state={r.state} /></b><small>{r.date} {r.time} · {r.people}명</small></span></div>
          {r.state === 'pending' && <div className="notice sm"><Icon n="clock" s={15} sw={2.2} />음식점이 확인하는 중이에요 · 보통 5분 안에 답이 와요</div>}
          {r.state === 'confirmed' && <div className="notice sm green-n"><Icon n="check" s={15} sw={2.4} />예약이 확정됐어요 · 방문 10분 전 알림을 보내드려요</div>}
          {r.state === 'rejected' && <div className="notice sm red-n"><Icon n="x" s={15} sw={2.4} />해당 시간엔 자리가 어려워요 · 다른 가게를 추천받아 보세요</div>}
          {r.state === 'done' && <div className="notice sm gray-n"><Icon n="star" s={15} sw={2} />방문 완료 · 리뷰를 남겨 주세요</div>}
        </button> })}
        {!list.length && <div className="empty">해당하는 예약이 없어요.</div>}
        <p className="foot">※ 음식점이 수락하기 전까지는 예약 확정이 아니에요.</p>
      </main>
      <TabBar />
    </> },

    // ================= 14 찜한 가게 =================
    favorites: () => <>
      <StatusBar /><Header title="찜한 가게" />
      <main className="scroll gray stack-pad">
        <p className="foot top">총 {liked.length}곳 · 하트를 누르면 찜이 해제돼요</p>
        {liked.map(byId).map(p => <ListCard key={p.id} p={p} meta={`${p.short} · 도보 ${p.walk}분${p.group ? ' · 단체석' : ''}`} />)}
        {!liked.length && <div className="empty">찜한 가게가 없어요. 마음에 드는 가게에 하트를 눌러 보세요.</div>}
      </main>
      <TabBar />
    </>,

    // ================= 15 방문 기록 · 설정 =================
    visits: () => <>
      <StatusBar /><Header title="방문 기록 · 설정" right="" />
      <main className="scroll gray settings">
        <h3>이전 방문 음식점</h3>
        {[[1, '11월 4일 (수) · 혼자', true], [3, '10월 29일 (목) · 혼자', true], [7, '10월 22일 (목) · 2명', false]].map(([id, d, done]) => <div className="visit" key={id}><span><b>{byId(id).name}</b><small>{d}</small></span><em className={done ? 'rv done' : 'rv write'}>{done ? '리뷰 완료' : '리뷰 쓰기'}</em><button onClick={() => go('detail', id)}>다시 가기 ›</button></div>)}
        <h3>선호 음식 카테고리</h3>
        <div className="toggle-chips">{['한식', '일식', '카페', '중식', '양식', '분식'].map(c => <button key={c} className={prefs.cats.includes(c) ? 'on' : ''} onClick={() => setPrefs(p => ({ ...p, cats: p.cats.includes(c) ? p.cats.filter(x => x !== c) : [...p.cats, c] }))}>{c}</button>)}</div>
        <h3>기본 예산</h3>
        <div className="toggle-chips">{['1만 원 이하', '1~1.5만 원', '상관없음'].map(b => <button key={b} className={prefs.budget === b ? 'on' : ''} onClick={() => setPrefs(p => ({ ...p, budget: b }))}>{b}</button>)}</div>
        <h3>알림 설정</h3>
        {[['alarm', '예약 결과 알림'], ['news', '새로 생긴 가게 소식']].map(([k, l]) => <div className="switch-row" key={k}><span>{l}</span><button className={'switch' + (prefs[k] ? ' on' : '')} onClick={() => setPrefs(p => ({ ...p, [k]: !p[k] }))} aria-label={l}><i /></button></div>)}
        <button className="card link-row" onClick={openChat}><Icon n="msg" s={18} className="orange" /><b>과거 AI 채팅 기록 보기</b><Icon n="right" s={18} className="muted" /></button>
      </main>
      <TabBar />
    </>,

    // ================= 투표방 =================
    vote: () => <>
      <StatusBar /><Header title="투표방" right="친구와 함께" />
      <main className="scroll gray vote">
        {voteStage === 'setup' ? <>
          <div className="card vote-intro"><b>어디 갈지 친구들과 정해요</b><p>후보를 2곳 이상 고르고 투표를 시작하면, 링크로 친구들을 초대할 수 있어요.</p></div>
          <div className="sec-head"><h2>후보 고르기</h2><span className="orange">{voteIds.length}곳 선택</span></div>
          {SOLO_ORDER.map(byId).map(p => { const on = voteIds.includes(p.id); return <button key={p.id} className={'card vote-pick' + (on ? ' on' : '')} onClick={() => setVoteIds(v => on ? v.filter(x => x !== p.id) : [...v, p.id])}><Thumb p={p} size={52} /><span className="lc-body"><b>{p.name}</b><small>{p.cat} · 도보 {p.walk}분 · {p.price}</small></span><span className="vchk">{on && <Icon n="check" s={14} sw={3} />}</span></button> })}
          <button className="btn primary" disabled={voteIds.length < 2} onClick={startVote}>{voteIds.length < 2 ? '후보를 2곳 이상 골라 주세요' : `투표 시작하기 (${voteIds.length}곳)`}</button>
        </> : (() => {
          const total = Object.values(votes).reduce((a, b) => a + b, 0)
          const ranked = [...voteIds].sort((a, b) => (votes[b] || 0) - (votes[a] || 0))
          const top = byId(ranked[0])
          return <>
            <div className="card vote-intro"><b>오늘 공강, 어디 갈까?</b><p>참여 {total}명 · 마감 오늘 12:40 · {myVote == null ? '아직 투표하지 않았어요' : '다른 가게를 누르면 투표를 바꿀 수 있어요'}</p><div className="avatars">{['나', '민', '서', '준'].map((n, i) => <span key={n} className={i === 0 && myVote == null ? 'wait' : ''}>{n}</span>)}</div></div>
            {voteIds.map(id => { const p = byId(id); const n = votes[id] || 0; const pct = total ? Math.round(n / total * 100) : 0; return <button key={id} className={'card vote-opt' + (myVote === id ? ' mine' : '')} onClick={() => castVote(id)}><span className="vbar" style={{ width: pct + '%' }} /><Thumb p={p} size={44} /><span className="lc-body"><b>{p.name}</b><small>도보 {p.walk}분 · {p.price}</small></span><span className="vcount">{n}표{myVote === id && <small>내 선택</small>}</span></button> })}
            <button className="btn soft" onClick={() => share(VOTE_LINK)}><Icon n="link" s={16} />투표 링크 공유하기</button>
            <button className="btn primary" onClick={() => go('detail', top.id)}>1위 {top.name} 보러 가기<Icon n="right" s={16} sw={2.6} /></button>
            <button className="text-btn" onClick={() => setVoteStage('setup')}>후보 다시 고르기</button>
          </>
        })()}
      </main>
    </>,
  }

  const sheetBody = {
    from: { title: '지금 어디에 있나요?', sub: '건물에서 정문까지 걷는 시간을 포함해 다녀올 수 있는 가게를 다시 골라요.' },
    to: { title: '다음 수업은 어느 건물인가요?', sub: '건물에서 정문까지 걷는 시간을 포함해 다녀올 수 있는 가게를 다시 골라요.' },
    people: { title: '몇 명이 모이나요?', sub: '인원이 들어가는 단체석이 있는 가게만 골라요.' },
    date: { title: '언제 모이나요?', sub: '모임 날짜를 고르면 그날 예약 가능한 가게를 찾아요.' },
  }[sheet]

  return <div className="web-back"><div className="phone">
    {screens[page]()}
    {sheet && <div className="sheet-dim" onClick={() => setSheet(null)}><div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-handle" /><b>{sheetBody.title}</b><p className="sheet-sub">{sheetBody.sub}</p>
      {(sheet === 'from' || sheet === 'to') && <><div className="building-grid">{BUILDINGS.map(b => { const cur = sheet === 'from' ? fromB : toB; return <button key={b.name} className={cur === b.name ? 'on' : ''} onClick={() => { (sheet === 'from' ? setFromB : setToB)(b.name); setSheet(null) }}><b>{b.name}</b><small>정문까지 {b.gate}분</small></button> })}</div><p className="sheet-note">* 도보 시간은 샘플 추정값이에요. 지금 {fromB}→정문 {gateOf(fromB)}분, 정문→{toB} {gateOf(toB)}분</p></>}
      {sheet === 'people' && <div className="building-grid">{[4, 8, 12, 16, 20, 25, 30, 40].map(n => <button key={n} className={people === n ? 'on' : ''} onClick={() => { setPeople(n); setSheet(null) }}><b>{n}명</b><small>단체석 {groups.filter(p => p.max >= n).length}곳</small></button>)}</div>}
      {sheet === 'date' && <div className="building-grid">{['2026-11-12', '2026-11-13', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19'].map(d => <button key={d} className={bookDate === d ? 'on' : ''} onClick={() => { setBookDate(d); setSheet(null) }}><b>{fmtDate(d)}</b><small>저녁 7시 기준</small></button>)}</div>}
    </div></div>}
    {toast && <div className="toast">{toast}</div>}
  </div><p className="dev-note">어디가게 · 피그마 프로토타입 기반 구현 데모<br />가게 정보·예약·AI 추천은 시연용 샘플이며 실제 서비스와 연결되어 있지 않습니다.</p></div>
}
