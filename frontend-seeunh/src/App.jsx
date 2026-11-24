import { useState } from 'react'
import './App.css'

const places = [
  { id: 1, name: '청춘 김밥', category: '한식 · 분식', price: '4,500원', distance: '도보 3분', walk: '3분', rating: '4.8', icon: '🍙', reason: '가장 가깝고 저렴', desc: '가볍고 빠르게 혼밥하기 좋은 곳이에요.', open: true, menu: '참치 김밥' },
  { id: 2, name: '모모 우동', category: '일식 · 우동', price: '7,500원', distance: '도보 6분', walk: '6분', rating: '4.7', icon: '🍜', reason: '국물 · 혼밥 좌석', desc: '따뜻한 국물과 편안한 혼밥 좌석이 있어요.', open: true, menu: '모모 우동' },
  { id: 3, name: '광운 돌솥식당', category: '한식 · 돌솥', price: '8,500원', distance: '도보 4분', walk: '4분', rating: '4.9', icon: '🍲', reason: '든든한 한 끼', desc: '정문 앞에서 든든하게 식사하기 좋아요.', open: true, menu: '돌솥비빔밥' },
  { id: 4, name: '화로 한상', category: '단체석 · 고기', price: '1인 18,000원', distance: '도보 8분', walk: '8분', rating: '4.6', icon: '🥩', reason: '단체 모임 추천', desc: '단체 좌석이 있어 회식이나 모임에 적합해요.', open: true, menu: '모둠 고기' },
  { id: 5, name: '영축산 정육식당', category: '정육식당 · 단체', price: '1인 20,000원', distance: '도보 4분', walk: '4분', rating: '4.7', icon: '🍖', reason: '넓은 공간', desc: '여럿이 함께 가기 좋은 넓은 매장이에요.', open: true, menu: '한우 모둠' },
  { id: 6, name: '카페 온도', category: '카페 · 디저트', price: '3,800원~', distance: '도보 5분', walk: '5분', rating: '4.6', icon: '☕', reason: '조용한 분위기', desc: '커피 한잔하며 쉬기 좋은 카페예요.', open: true, menu: '카페라테' },
]
const INITIAL_BOT = [{ role: 'bot', text: '안녕하세요! 공강 시간을 기준으로 찾아볼게요. 오늘은 어떤 게 당기세요?' }]
const navItems = [{ id: 'home', symbol: '➤', label: '홈' }, { id: 'map', symbol: '▤', label: '지도' }, { id: 'chat', symbol: '✧', label: 'AI 추천' }, { id: 'my', symbol: '♙', label: '마이' }]

function App() {
  const [page, setPage] = useState('home')
  const [history, setHistory] = useState([])
  const [mode, setMode] = useState('solo')
  const [minutes, setMinutes] = useState(60)
  const [budget, setBudget] = useState('2만 원')
  const [people, setPeople] = useState(25)
  const [selectedId, setSelectedId] = useState(1)
  const [liked, setLiked] = useState([3, 2, 6, 4])
  const [chatMessages, setChatMessages] = useState(INITIAL_BOT)
  const [message, setMessage] = useState('')
  const [bookingState, setBookingState] = useState('pending')
  const [reservations, setReservations] = useState([])
  const [bookingDate, setBookingDate] = useState('2026-11-19')
  const [bookingTime, setBookingTime] = useState('19:00')
  const [note, setNote] = useState('단체석으로 부탁드려요. 알레르기가 있는 인원이 있어요.')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('전체')
  const [mapSelection, setMapSelection] = useState(4)
  const [showGuide, setShowGuide] = useState(false)
  const place = places.find(p => p.id === selectedId) || places[0]
  const choices = mode === 'solo' ? places.slice(0, 3) : [places[4], places[3], places[2]]

  const go = (next, id) => {
    if (id != null) setSelectedId(id)
    setHistory(old => [...old, page])
    setPage(next)
    window.scrollTo(0, 0)
  }
  const back = () => {
    if (history.length) { setPage(history[history.length - 1]); setHistory(history.slice(0, -1)) }
    else setPage('home')
    window.scrollTo(0, 0)
  }
  const navigate = (next) => { setHistory([]); setPage(next); window.scrollTo(0, 0) }
  const toggleLike = (id) => setLiked(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id])
  const sendMessage = (text = message) => {
    if (!text.trim()) return
    setChatMessages(old => [...old, { role: 'user', text }, { role: 'bot', text: mode === 'solo' ? '도보 10분 안, 지금 영업 중인 3곳을 골랐어요!' : '25명 단체 이용에 적합한 곳을 골랐어요! 아래 후보들을 비교해 보세요.', results: true }])
    setMessage('')
  }
  const requestBooking = () => {
    setBookingState('pending')
    setReservations(old => [{ id: Date.now(), place: place.name, date: bookingDate, time: bookingTime, people, state: 'pending' }, ...old])
    go('bookingStatus')
  }

  const Header = ({ title, right = '샘플 데이터' }) => <header className="top-header"><button className="back-btn" onClick={back} aria-label="뒤로 가기">‹</button><strong>{title}</strong><small>{right}</small></header>
  const BottomNav = () => <nav className="bottom-nav">{navItems.map(item => <button key={item.id} className={(page === item.id || page === 'compare' && item.id === 'chat') ? 'active' : ''} onClick={() => navigate(item.id)}><span className="nav-symbol">{item.symbol}</span><span>{item.label}</span></button>)}</nav>
  const PlaceCard = ({ item, horizontal = false }) => <div className={'place-card ' + (horizontal ? 'horizontal' : '')} onClick={() => go('detail', item.id)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && go('detail', item.id)}><div className={'food-thumb food-' + item.id}><span>{item.icon}</span></div><div className="place-copy"><div className="place-tag">{item.category}</div><b>{item.name}</b><div className="muted small">{item.distance} · ★ {item.rating}</div><strong className="price">{item.price}</strong></div><button className={'heart ' + (liked.includes(item.id) ? 'on' : '')} onClick={(e) => { e.stopPropagation(); toggleLike(item.id) }} aria-label="찜하기">{liked.includes(item.id) ? '♥' : '♡'}</button></div>

  return <div className="web-back"><div className="phone"><div className="statusbar"><span>9:41</span><span>▂▅▇  ◉ ▰</span></div>
    {page === 'home' && <><div className="home-heading"><div className="eyebrow">오늘도 맛있는 한 끼</div><div className="brand-row"><h1>광운대 어디가게</h1><span className="coin">👍 투표방</span></div><div className="searchbox">⌕ <input value={search} onChange={e => setSearch(e.target.value)} placeholder="식당, 메뉴를 검색해 보세요" /></div></div><main className="content gray"><div className="card planner"><div className="switch-tabs"><button className={mode === 'solo' ? 'chosen' : ''} onClick={() => setMode('solo')}>◷ 공강 식사</button><button className={mode === 'group' ? 'chosen' : ''} onClick={() => setMode('group')}>♧ 단체 모임</button></div><div className="two-col"><div className="field"><span>{mode === 'solo' ? '지금 여기서' : '모임 날짜'}</span><b>{mode === 'solo' ? '📍 새빛관' : '📅 11월 19일 (목)'}</b></div><div className="field"><span>{mode === 'solo' ? '다음 수업은' : '인원'}</span><b>{mode === 'solo' ? '📍 비마관' : `${people}명`}</b></div></div><div className="between"><b>{mode === 'solo' ? '공강 시간' : '1인 예산'}</b><span className="orange">{mode === 'solo' ? `${minutes}분` : budget}</span></div><div className="option-row">{(mode === 'solo' ? [30, 45, 60, 120] : ['1만 원', '2만 원', '3만 원', '상관없음']).map(val => <button key={val} className={(mode === 'solo' ? minutes === val : budget === val) ? 'picked' : ''} onClick={() => mode === 'solo' ? setMinutes(val) : setBudget(val)}>{mode === 'solo' ? `${val}분` : val}</button>)}</div><button className="primary full" onClick={() => { sendMessage(mode === 'solo' ? `${minutes}분 공강에 혼자 먹을 수 있는 곳 추천해줘` : `${people}명 단체 모임할 곳 추천해줘`); go('chat') }}>{mode === 'solo' ? `${minutes}분 안에 다녀올 6곳 ›` : `${people}명 단체 식사 장소 6곳 ›`}</button></div><div className="section-head"><h2>{mode === 'solo' ? '지금 딱 맞는 식당' : '단체로 가기 좋은 곳'}</h2><button onClick={() => go('chat')}>전체보기</button></div><div className="place-grid">{(search ? places.filter(x => x.name.includes(search) || x.category.includes(search)) : mode === 'solo' ? places.slice(0, 2) : [places[4], places[3]]).map(item => <PlaceCard key={item.id} item={item} />)}</div></main><BottomNav /></>}

    {page === 'chat' && <><Header title="AI 추천" /><div className="context-chip">◷ {mode === 'solo' ? `공강 ${minutes}분 · 새빛관 → 비마관 · 1만 원 이하` : `11월 19일 19:00 · ${people}명 · 단체`}</div><main className="chat-body"><div className="messages">{chatMessages.map((m, i) => <div className={'bubble-row ' + m.role} key={i}>{m.role === 'bot' && <span className="bot-avatar">✧</span>}<div className="bubble">{m.text}{m.results && <div className="result-inline">{choices.map(p => <button key={p.id} className="mini-result" onClick={() => go('detail', p.id)}><span>{p.icon}</span><span><b>{p.name}</b><small>{p.price} · 도보 {p.walk}</small></span><span>›</span></button>)}<button className="soft-button full" onClick={() => go('compare')}>한눈에 비교하기</button></div>}</div></div>)}</div><div className="suggestion"><button onClick={() => sendMessage('혼자 빨리 먹을 수 있는 곳 추천해줘')}>혼자 빨리 먹을 곳</button><button onClick={() => sendMessage('단체로 예약 가능한 곳 알려줘')}>단체 예약</button></div></main><div className="chat-compose"><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="원하는 조건을 말해 보세요" /><button onClick={() => sendMessage()}>➤</button></div><BottomNav /></>}

    {page === 'compare' && <><Header title="추천 결과 비교" /><main className="content comparison"><div className="compare-grid">{choices.map((p,i) => <div className={'compare-place '+(i===0?'first':'')} key={p.id}><div className="food-thumb"><span>{p.icon}</span></div><b>{p.name}</b><button className={'heart '+(liked.includes(p.id)?'on':'')} onClick={()=>toggleLike(p.id)}>{liked.includes(p.id)?'♥':'♡'}</button></div>)}</div>{[['대표 메뉴', ...choices.map(p => p.price)], ['도보 거리', ...choices.map(p => p.walk)], ['영업 상태', ...choices.map(p => p.open ? '영업 중' : '마감')], ['추천 이유', ...choices.map(p => p.reason)]].map((row,i)=><div className="compare-row" key={i}><span>{row[0]}</span>{row.slice(1).map((val,j)=><b key={j} className={i===2?'green':''}>{val}</b>)}</div>)}<div className="compare-actions">{choices.map(p=><button key={p.id} className="soft-button" onClick={()=>go('detail',p.id)}>상세</button>)}</div><div className="grow"/><button className="outline full" onClick={()=>{setChatMessages(INITIAL_BOT);go('chat')}}>조건 바꿔서 다시 추천받기</button><button className="primary full" onClick={()=>go('detail', choices[0].id)}>1순위 가게 상세 보기</button></main></>}

    {page === 'detail' && <><div className={'detail-hero food-'+place.id}><span className="hero-emoji">{place.icon}</span><button className="floating left" onClick={back}>‹</button><button className="floating right" onClick={()=>toggleLike(place.id)}>{liked.includes(place.id)?'♥':'♡'}</button><div className="detail-hero-title"><span className="tiny-tag">{place.category}</span><h1>{place.name}</h1><small>📍 정문에서 {place.distance} · 광운대 주변</small></div></div><main className="detail-content"><div className="info-row"><span>◷ 11:00 – 21:00 · 브레이크타임 15:00–17:00</span><b className="green">영업 중</b></div><div className="tag-row"><span>혼밥 가능</span><span>단체석 20석</span><span>예약 가능</span></div><div className="eta-card"><b>◷ 공강시간 계산</b><div className="eta-grid"><div>출발 <strong>12:00</strong></div><div className="highlight">식사 <strong>약 25분</strong></div><div>복귀 <strong>13:33</strong></div></div><small>왕복 도보 {place.walk} · 다음 수업 전 여유 있게 돌아와요</small></div><h3>이런 곳이에요</h3><p>{place.desc} 직접 방문해서 맛있는 한 끼를 즐겨보세요.</p><h3>대표 메뉴</h3><div className="menu-card"><span>{place.icon}</span><b>{place.menu}</b><strong className="orange">{place.price}</strong></div></main><div className="fixed-actions"><button className="soft-button" onClick={()=>go('chat')}>AI에게 물어보기</button><button className="primary" onClick={()=>go('booking')}>예약 요청</button></div><BottomNav /></>}

    {page === 'booking' && <><Header title="예약 요청"/><main className="content booking"><div className="book-place"><div className={'food-thumb food-'+place.id}>{place.icon}</div><div><b>{place.name}</b><div className="muted small">{place.category} · {place.distance} · 최대 30명</div><strong className="price">{place.price}</strong></div><button onClick={()=>toggleLike(place.id)} className="heart">{liked.includes(place.id)?'♥':'♡'}</button></div><div className="form-grid"><label className="field"><span>방문 날짜</span><input type="date" value={bookingDate} onChange={e=>setBookingDate(e.target.value)} /></label><label className="field"><span>방문 시간</span><input type="time" value={bookingTime} onChange={e=>setBookingTime(e.target.value)} /></label></div><div className="field"><span>예약 인원</span><div className="counter"><b>{people}명</b><div><button onClick={()=>setPeople(Math.max(1,people-1))}>−</button><button onClick={()=>setPeople(Math.min(50,people+1))}>＋</button></div></div></div><div className="field"><span>요청자 연락처</span><input defaultValue="010-1234-5678 (샘플)" /></div><label className="field"><span>추가 요청사항</span><textarea rows="3" value={note} onChange={e=>setNote(e.target.value)}/></label><div className="warning">◷ 음식점이 수락하기 전까지는 예약이 확정되지 않아요.</div><div className="grow"/><button className="primary full" onClick={requestBooking}>예약 요청 보내기</button></main></>}

    {page === 'bookingStatus' && <><div className="result-screen"><div className={'result-icon '+(bookingState==='confirmed'?'success':bookingState==='rejected'?'error':'')}>{bookingState==='confirmed'?'✓':bookingState==='rejected'?'×':'◷'}</div><h1>{bookingState==='confirmed'?'예약이 확정됐어요':bookingState==='rejected'?'예약이 거절됐어요':'예약을 요청했어요'}</h1><span className="status-pill">{bookingState==='confirmed'?'예약 확정':bookingState==='rejected'?'예약 거절':'확인 대기'}</span><p className="muted">{bookingState==='confirmed'?'음식점이 예약을 수락했어요.':bookingState==='rejected'?'다른 가게를 추천해 드릴게요.':'음식점에서 확인하고 있어요. 수락되면 알려드릴게요.'}</p><div className="summary-card">{[['음식점',place.name],['날짜',bookingDate],['시간',bookingTime],['인원',`${people}명`]].map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div><p className="muted small">※ 현재는 시연용 데이터입니다. 실제 음식점에 요청이 전송되지 않습니다.</p><div className="grow"/><button className="primary full" onClick={()=>navigate('reservations')}>예약 내역 확인</button><button className="outline full" onClick={()=>navigate('home')}>홈으로</button><button className="demo-link" onClick={()=>setShowGuide(!showGuide)}>시연용 상태 변경 ▾</button>{showGuide&&<div className="demo-options"><button onClick={()=>{setBookingState('confirmed');setReservations(old=>old.map((r,i)=>i===0?{...r,state:'confirmed'}:r))}}>예약 확정 보기</button><button onClick={()=>{setBookingState('rejected');setReservations(old=>old.map((r,i)=>i===0?{...r,state:'rejected'}:r))}}>예약 거절 보기</button><button onClick={()=>setBookingState('pending')}>대기 보기</button></div>}</div></>}

    {page === 'map' && <><div className="map-wrap"><div className="map-search">⌕ 이 근처에서 찾기</div><div className="map-filter">{['지금 영업 중','밥','카페','술'].map(x=><button key={x} onClick={()=>setTab(x)} className={tab===x?'active':''}>{x}</button>)}</div><div className="mock-map"><div className="road horizontal-road"/><div className="road vertical-road"/><span className="map-label center-label">● 광운대 정문</span>{places.slice(0,5).map((p,i)=><button key={p.id} style={{left:`${15+(i%3)*26}%`,top:`${25+Math.floor(i/3)*32}%`}} className={'map-pin '+(mapSelection===p.id?'selected':'')} onClick={()=>setMapSelection(p.id)}>{p.name}</button>)}</div><div className="map-bottom"><h3>{places.find(p=>p.id===mapSelection)?.name}</h3><p className="muted small">광운대 정문에서 도보 {places.find(p=>p.id===mapSelection)?.walk} · 영업 중</p><div className="two-col"><button className="outline" onClick={()=>go('detail',mapSelection)}>가게 상세</button><button className="primary" onClick={()=>go('guide',mapSelection)}>길안내 시작</button></div></div></div><BottomNav/></>}

    {page === 'guide' && <><Header title={`${place.name}까지 걸어서 ${place.walk}`}/><main className="guide-content"><div className="guide-map"><div className="route-line"/><span>📍 광운대 정문</span><strong>{place.name} {place.icon}</strong></div><div className="card"><h1 className="orange">{place.walk}</h1><p>예상 도착까지 · 약 350m</p><div className="step">① 정문에서 나와 오른쪽으로</div><div className="step">② 광운로 따라 직진</div><div className="step">③ 사거리에서 오른쪽</div><button className="primary full" onClick={()=>go('detail')}>도착했어요</button></div></main></>}

    {page === 'my' && <><main className="content my-page"><h1>마이페이지</h1><div className="profile"><span>광</span><div><b>광운 학생</b><small>광운대학교 재학생 · 샘플 계정</small></div></div><div className="stats"><button onClick={()=>go('reservations')}><b>{reservations.length}</b>예약</button><button onClick={()=>go('favorites')}><b>{liked.length}</b>찜한 가게</button><button><b>12</b>방문</button></div><div className="section-head"><h2>이번 주 예약</h2><button onClick={()=>go('reservations')}>전체 ›</button></div>{reservations.length?reservations.slice(0,2).map(r=><div className="book-place" key={r.id}><b>{r.place}</b><span className="muted small">{r.date} · {r.time}</span></div>):<div className="empty">아직 예약 내역이 없어요.</div>}<div className="section-head"><h2>찜한 가게</h2><button onClick={()=>go('favorites')}>전체 ›</button></div><div className="fav-preview">{places.filter(p=>liked.includes(p.id)).slice(0,2).map(p=><PlaceCard key={p.id} item={p} horizontal/>)}</div></main><BottomNav/></>}

    {page === 'reservations' && <><Header title="예약 내역"/><main className="content gray"><div className="pill-tabs">{['전체','확인 대기','예약 확정','예약 거절'].map(t=><button onClick={()=>setTab(t)} className={tab===t?'active':''} key={t}>{t}</button>)}</div>{reservations.filter(r=>tab==='전체'||(r.state==='pending'?'확인 대기':r.state==='confirmed'?'예약 확정':'예약 거절')===tab).map(r=><div className="reservation-card" key={r.id}><div><b>{r.place}</b><span className={'status-pill '+r.state}>{r.state==='pending'?'확인 대기':r.state==='confirmed'?'예약 확정':'예약 거절'}</span></div><p>{r.date} · {r.time} · {r.people}명</p><div className="warning small">시연용 예약 내역 · 실제 예약 아님</div></div>)}{reservations.length===0&&<div className="empty">예약 내역이 없어요. 가게를 골라 예약을 요청해 보세요.</div>}</main></>}

    {page === 'favorites' && <><Header title="찜한 가게"/><main className="content gray"><p className="muted small">총 {liked.length}곳 · 하트를 누르면 찜이 해제돼요</p>{places.filter(p=>liked.includes(p.id)).map(p=><PlaceCard item={p} horizontal key={p.id} />)}</main></>}
  </div><div className="dev-note">어디가게 · 피그마 기반 중간 구현 데모<br/>예약 · AI 추천 · 지도는 시연용이며 실제 서비스와 연결되어 있지 않습니다.</div></div>
}
export default App
