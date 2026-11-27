// 사장님 앱 — 피그마 「어디가게 앱」 O-00 ~ O-08 화면. 모든 값은 시연용 샘플입니다.
import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { StatusBar } from './ui.jsx'

const img = name => `${import.meta.env.BASE_URL}food/${name}.jpg`
const TABS = [{ id: 'home', icon: 'home', label: '홈' }, { id: 'manage', icon: 'cal', label: '예약' }, { id: 'status', icon: 'toggle', label: '상태' }, { id: 'my', icon: 'user', label: '마이' }]
const TAB_OF = { home: 'home', request: 'home', accepted: 'home', alerts: 'home', manage: 'manage', status: 'status', my: 'my', reviews: 'my', settings: 'my' }
const STORES = [{ name: '영축산 정육식당', sub: '정육식당 · 노원구 광운로 일대' }, { name: '영축산 숯불구이', sub: '고기구이 · 노원구 월계동' }]
const MENU = [['돼지갈비 800g', '37,000원', 'jeongyuk'], ['뒷고기 600g', '26,000원', 'golmok'], ['된장찌개', '7,000원', 'sundae']]
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Owner({ onLiveChange, onExit }) {
  const [page, setPage] = useState('connect')
  const [history, setHistory] = useState([])
  const [query, setQuery] = useState('영축산')
  const [store, setStore] = useState(0)
  const [biz, setBiz] = useState('123-45-*****')
  const [verified, setVerified] = useState(true)
  const [left, setLeft] = useState(272) // 4:32
  const [req, setReq] = useState('pending') // pending | accepted | confirmed | suggested | rejected
  const [sheet, setSheet] = useState(null) // suggest | reject | voice
  const [slot, setSlot] = useState('20:00')
  const [reason, setReason] = useState('만석')
  const [mode, setMode] = useState('영업 중')
  const [accepting, setAccepting] = useState(true)
  const [benefit, setBenefit] = useState(true)
  const [lastOrder, setLastOrder] = useState(true)
  const [closeEarly, setCloseEarly] = useState(null)
  const [soldOut, setSoldOut] = useState(['된장찌개'])
  const [solo, setSolo] = useState('여유')
  const [groupOk, setGroupOk] = useState('가능')
  const [paused, setPaused] = useState(false)
  const [view, setView] = useState('week')
  const [visited, setVisited] = useState([])
  const [day, setDay] = useState(13)
  const [reply, setReply] = useState('')
  const [replied, setReplied] = useState(false)
  const [maxGroup, setMaxGroup] = useState(2)
  const [push, setPush] = useState(true)
  const [kakao, setKakao] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => { if (req !== 'pending') return; const t = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t) }, [req])
  // 바꾼 상태를 학생 화면(영축산 정육식당)에 바로 반영
  useEffect(() => { onLiveChange?.({ status: paused || !accepting ? '예약 일시 중지' : closeEarly ? `오늘 ${closeEarly} 마감` : mode, hours: closeEarly ? `오늘만 ${closeEarly} 마감 · 원래 매일 12:00 – 24:00` : undefined }) }, [mode, closeEarly, paused, accepting, onLiveChange])

  const showToast = t => { setToast(t); setTimeout(() => setToast(''), 1800) }
  const go = next => { setHistory(h => [...h, page]); setPage(next); setSheet(null) }
  const back = () => { setSheet(null); if (history.length) { setPage(history[history.length - 1]); setHistory(history.slice(0, -1)) } else setPage('home') }
  const tab = next => { setHistory([]); setPage(next); setSheet(null) }

  const reqLabel = { pending: ['요청 중', 'pending'], accepted: ['예약금 대기', 'wait'], confirmed: ['확정', 'confirmed'], suggested: ['시간 제안', 'wait'], rejected: ['거절', 'rejected'] }[req]
  const today = [['12:30', '4명 · 혼밥 바 2 + 테이블', '확정', 'confirmed'], ['13:30', '2명 · 김치찌개 2 선주문', '출발 대기', 'wait'], [req === 'suggested' ? slot : '19:00', '25명 · 단체석', ...reqLabel]].filter(r => r[2] !== '거절')

  const Header = ({ title, right = '샘플 데이터' }) => <header className="top-header"><button className="round-btn" onClick={back} aria-label="뒤로 가기"><Icon n="back" s={20} sw={2.4} /></button><strong>{title}</strong>{right && <small>{right}</small>}</header>
  const TabBar = () => <nav className="tabbar">{TABS.map(t => <button key={t.id} className={TAB_OF[page] === t.id ? 'on' : ''} onClick={() => tab(t.id)}><Icon n={t.icon} s={22} sw={1.8} /><span>{t.label}</span></button>)}</nav>
  const Switch = ({ on, set, label }) => <button className={'switch' + (on ? ' on' : '')} onClick={() => set(!on)} aria-label={label}><i /></button>
  const Seg = ({ items, value, set, dark = true }) => <div className={'o-seg' + (dark ? '' : ' light')}>{items.map(x => <button key={x} className={value === x ? 'on' : ''} onClick={() => set(x)}>{x}</button>)}</div>
  const Badge = ({ k, children }) => <em className={'o-badge ' + k}>{children}</em>
  const RequestRows = () => <div className="summary">{[['날짜', '11월 13일 (목)'], ['시간', req === 'suggested' ? `오후 ${slot.replace(':00', ':00')} (제안)` : '오후 7:00'], ['인원', '25명'], ['좌석', '단체석'], ['예약자', '한지원 · OO학과 학생회'], ['연락처', '010-12**-**78']].map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div>

  const screens = {
    // O-00 가게 연결 · 사업자 확인
    connect: () => <>
      <StatusBar />
      <main className="scroll o-connect">
        <h1 className="o-title">내 가게 연결하기</h1>
        <p className="muted o-sub">가게를 검색해 연결하면 위치·영업시간·메뉴가<br />자동으로 채워져요.</p>
        <div className="o-steps"><span className="on"><em>1</em>가게 찾기</span><i /><span className={verified ? 'on' : ''}><em>2</em>사업자 확인</span></div>
        <label className="searchbox"><Icon n="search" s={19} sw={2.2} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="가게 이름으로 검색" /></label>
        <div className="o-stores">{STORES.filter(s => s.name.includes(query.trim())).map((s, i) => <button key={s.name} className={store === i ? 'on' : ''} onClick={() => setStore(i)}><span><b>{s.name}</b><small>{s.sub}</small></span>{store === i && <i><Icon n="check" s={16} sw={3} /></i>}</button>)}</div>
        <h3>사업자 확인</h3>
        <p className="muted small">사업자 확인을 마치면 예약을 받을 수 있어요.</p>
        <div className="o-biz"><input value={biz} onChange={e => { setBiz(e.target.value); setVerified(false) }} inputMode="numeric" /><button onClick={() => setVerified(biz.replace(/[^0-9*]/g, '').length >= 10)}>확인</button></div>
        {verified ? <span className="o-ok">✓ 확인 완료 · {STORES[store].name}</span> : <span className="o-no">사업자 등록번호 10자리를 입력해 주세요 (시연용)</span>}
        <div className="grow" />
        <button className="btn primary" disabled={!verified} onClick={() => tab('home')}>이 가게로 시작하기</button>
        <button className="text-btn center-t" onClick={onExit}>학생 앱으로 돌아가기</button>
      </main>
    </>,

    // O-01 홈 · 오늘
    home: () => <>
      <StatusBar />
      <main className="scroll gray o-home">
        <div className="o-top"><div><h1>{STORES[store].name}</h1><small>오늘 11월 13일 (목)</small></div><button className="o-voice-btn" onClick={() => { tab('status'); setSheet('voice') }}><Icon n="mic" s={16} sw={2.2} />말로 수정</button><button className="o-bell" onClick={() => go('alerts')} aria-label="알림"><Icon n="bell" s={22} /><i /></button></div>
        <div className="o-label">영업 상태</div>
        <div className="o-chips">{['영업 중', '브레이크타임', '재료 소진', '오늘 휴무'].map(m => <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{mode === m && m === '영업 중' && <i />}{m}</button>)}</div>
        <div className="card o-row"><b>예약 받기</b><small>바쁠 땐 끄면 일시 중지돼요</small>{Switch({ on: accepting, set: setAccepting, label: '예약 받기' })}</div>
        {req === 'pending' || req === 'suggested' ? <div className="o-new">
          <div className="o-new-top"><Badge k="pending">{req === 'suggested' ? `${slot} 제안 보냄` : '새 예약 요청'}</Badge>{req === 'pending' && <b><Icon n="clock" s={16} sw={2.2} />{fmt(left)} 남음</b>}</div>
          <h2>25명 · 목 {req === 'suggested' ? slot : '19:00'} · 단체석</h2>
          <p>한지원 (OO학과 학생회) · 개강총회</p>
          {req === 'pending' && <div className="o-bar"><i style={{ width: `${left / 300 * 100}%` }} /></div>}
          <button className="btn primary" onClick={() => go('request')}>{req === 'suggested' ? '학생 답 기다리는 중 · 요청 보기' : '요청 확인하기'}</button>
        </div> : <div className="card o-done-card" onClick={() => go(req === 'accepted' ? 'accepted' : 'manage')} role="button" tabIndex={0}><Badge k={reqLabel[1]}>{reqLabel[0]}</Badge><b>개강총회 25명 · 목 19:00</b><Icon n="right" s={18} className="muted" /></div>}
        <div className="sec-head o-sh"><h2>오늘 예약</h2><button onClick={() => tab('manage')}>전체 보기 ›</button></div>
        <div className="card o-timeline">{today.map(([t, d, l, k], i) => <div key={i}><b>{t}</b><i className={k === 'pending' ? 'or' : ''} /><span>{d}</span><Badge k={k}>{l}</Badge></div>)}</div>
        <div className="o-benefit"><span><b>혜택 시간 14:00–17:00</b><small>음료 서비스 · 30분당 3팀</small></span>{Switch({ on: benefit, set: setBenefit, label: '혜택 시간' })}</div>
      </main>
      {TabBar()}
    </>,

    // O-02 예약 요청 상세 (+ B 다른 시간 제안, C 거절 사유 시트)
    request: () => <>
      <StatusBar />{Header({ title: '예약 요청' })}
      <main className="scroll o-req">
        {req === 'pending' && <div className="o-timer"><Icon n="clock" s={18} sw={2.2} /><span><b>{fmt(left)} 안에 답해 주세요</b><small>답이 없으면 설정한 방식대로 처리돼요</small></span></div>}
        {req === 'suggested' && <div className="o-timer y"><Icon n="clock" s={18} sw={2.2} /><span><b>{slot}으로 다른 시간을 제안했어요</b><small>학생이 수락하면 예약이 확정돼요</small></span></div>}
        {req === 'rejected' && <div className="o-timer r"><Icon n="x" s={18} sw={2.4} /><span><b>거절했어요 · {reason}</b><small>학생에게 근처 다른 가게가 추천됐어요</small></span></div>}
        {RequestRows()}
        <h3>요청사항</h3>
        <div className="o-quote">“알레르기 있는 인원 있어요 (갑각류 2명)”</div>
        <b className="o-budget">1인 예산 2만 원 · 예상 50만 원</b>
        <p className="muted small">수락하면 학생회가 사장님 계좌로 예약금을 보내요 (최대 40%).</p>
        <div className="grow" />
        {req === 'pending' ? <><button className="btn primary" onClick={() => { setReq('accepted'); setPage('accepted') }}>수락</button><div className="two"><button className="btn outline" onClick={() => setSheet('suggest')}>다른 시간 제안</button><button className="btn outline" onClick={() => setSheet('reject')}>거절</button></div></>
          : <button className="btn outline" onClick={() => tab('home')}>홈으로</button>}
      </main>
    </>,

    // O-02-D 수락 완료 · 예약금 확인
    accepted: () => <>
      <StatusBar />{Header({ title: '예약 수락' })}
      <main className="scroll result">
        <div className="res-icon confirmed"><Icon n="check" s={38} sw={2.2} /></div>
        <h1>{req === 'confirmed' ? '예약이 확정됐어요' : '예약을 수락했어요'}</h1>
        <span className={'o-badge ' + (req === 'confirmed' ? 'confirmed' : 'wait')}>{req === 'confirmed' ? '예약 확정' : '예약금 대기'}</span>
        <p className="muted center">{req === 'confirmed' ? <>입금을 확인했어요. 학생회에 확정 알림을 보냈어요.</> : <>학생회가 24시간 안에 사장님 계좌로 예약금을 보내요.<br />어디가게는 돈을 받아 두지 않아요.</>}</p>
        <div className="summary">{[['예약', '11/13 (목) 19:00 · 25명'], ['예약금', '200,000원 (40%)'], ['받는 계좌', '국민 123-45-****** (사장님)'], ['입금 기한', '11/12 (수) 18:00까지']].map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div>
        {req !== 'confirmed' && <div className="notice o-n">입금 문자를 확인했다면 아래 버튼만 눌러 주세요.</div>}
        <div className="grow" />
        {req !== 'confirmed' && <button className="btn primary" onClick={() => { setReq('confirmed'); showToast('예약을 확정했어요') }}>입금 확인 · 예약 확정</button>}
        <button className="btn outline" onClick={() => tab('home')}>홈으로</button>
      </main>
    </>,

    // O-03 예약 관리 (주간 / 월간)
    manage: () => { const confirmed = [['목 12:30', '4명 · 혼밥 바 2 + 테이블'], ['목 13:30', '2명 · 김치찌개 2 선주문'], ['금 18:00', '6명 · 테이블']]; const pendingN = req === 'pending' || req === 'suggested' ? 1 : 0; return <>
      <StatusBar />
      <main className="scroll gray o-manage">
        <div className="o-top"><h1>예약 관리</h1><div className="o-pill-seg">{[['week', '주간'], ['month', '월간']].map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}</div></div>
        {view === 'week' ? <>
          <div className="u-tabs o-ut">{[`요청 중 ${pendingN}`, `확정 ${3 - visited.length + (req === 'confirmed' ? 1 : 0)}`, `방문 완료 ${5 + visited.length}`, '노쇼 0'].map((l, i) => <button key={l} className={i === 0 ? 'on' : ''}>{l}</button>)}</div>
          <div className="card o-week"><b>11월 2주차</b><div>{[['월', 10, 1], ['화', 11, 0], ['수', 12, 1], ['목', 13, 1], ['금', 14, 1], ['토', 15, 0], ['일', 16, 0]].map(([d, n, dot]) => <button key={n} className={day === n ? 'on' : ''} onClick={() => setDay(n)}><small>{d}</small><b>{n}</b>{dot ? <i /> : null}</button>)}</div></div>
          {pendingN > 0 && <div className="o-new sm" role="button" tabIndex={0} onClick={() => go('request')}><div className="o-new-top"><Badge k="pending">{req === 'suggested' ? '시간 제안' : '요청 중'}</Badge>{req === 'pending' && <b className="plain">{fmt(left)} 남음</b>}</div><h2>목 {req === 'suggested' ? slot : '19:00'} · 25명 · 단체석</h2><p>한지원 · OO학과 학생회 · 개강총회</p></div>}
          <div className="o-label">확정된 예약</div>
          {req === 'confirmed' && <div className="card o-res"><span><b>목 19:00</b><small>25명 · 단체석 · 개강총회</small></span><Badge k="confirmed">예약금 확인</Badge></div>}
          {confirmed.map(([t, d]) => <div className="card o-res" key={t}><span><b>{t}</b><small>{d}</small></span>{visited.includes(t) ? <Badge k="done">방문 완료됨</Badge> : <button className="btn soft sm" onClick={() => { setVisited(v => [...v, t]); showToast('학생에게 리뷰 요청을 보냈어요') }}>방문 완료</button>}</div>)}
          <p className="foot center-f">방문 완료 처리하면 학생에게 리뷰 요청이 가요.</p>
        </> : <>
          <div className="card o-cal"><div className="o-cal-head"><button aria-label="이전 달">‹</button><b>2026년 11월</b><button aria-label="다음 달">›</button></div>
            <div className="o-cal-grid">{['월', '화', '수', '목', '금', '토', '일'].map((d, i) => <small key={d} className={i >= 5 ? 'we' : ''}>{d}</small>)}{Array.from({ length: 6 }).map((_, i) => <span key={'e' + i} />)}{Array.from({ length: 30 }, (_, i) => i + 1).map(n => { const dots = { 3: 1, 5: 2, 10: 1, 12: 2, 13: 0, 14: 1, 19: 1, 20: 2, 26: 1, 27: 1 }[n]; return <button key={n} className={day === n ? 'on' : ''} onClick={() => setDay(n)}>{n}{dots ? <i>{Array.from({ length: dots }).map((_, j) => <em key={j} />)}</i> : null}</button> })}</div></div>
          <div className="o-label dark">11월 {day}일 · 예약 {day === 13 ? 3 : 0}건</div>
          {day === 13 ? today.map(([t, d, l, k], i) => <div className="card o-res" key={i}><b className="o-t">{t}</b><small className="o-d">{d}</small><Badge k={k}>{l}</Badge></div>) : <div className="empty">이 날은 예약이 없어요.</div>}
        </>}
      </main>
      {TabBar()}
    </> },

    // O-04 지금 상태 바꾸기 (+ B 말로 수정 시트)
    status: () => <>
      <StatusBar />
      <main className="scroll gray o-status">
        <h1 className="o-title">지금 상태 바꾸기</h1>
        <p className="muted o-sub">바꾸면 학생 화면에 바로 반영돼요</p>
        <button className="o-voice" onClick={() => setSheet('voice')}><span><Icon n="mic" s={20} sw={2.2} /></span><div><b>말로 바꾸기</b><small>“오늘 재료 다 떨어져서 3시에 문 닫아요”</small></div></button>
        <div className="o-label">영업</div>
        {Seg({ items: ['영업 중', '브레이크타임', '오늘만 일찍 마감'], value: closeEarly ? '오늘만 일찍 마감' : mode === '브레이크타임' ? '브레이크타임' : '영업 중', set: v => { if (v === '오늘만 일찍 마감') { setCloseEarly(c => c || '15:00'); setMode('영업 중') } else { setCloseEarly(null); setMode(v) } } })}
        {closeEarly && <div className="card o-row"><b>오늘 마감 시간</b><span className="o-change"><s>21:00</s>→<em>{closeEarly}</em></span></div>}
        <div className="card o-row" role="button" tabIndex={0} onClick={() => setLastOrder(!lastOrder)}><b>라스트오더 (오늘만)</b><span className="o-change"><s>20:30</s>→<em className={lastOrder ? '' : 'off'}>19:30</em></span></div>
        <div className="o-label">오늘 품절 메뉴</div>
        <div className="card o-checks">{MENU.map(([n]) => { const on = soldOut.includes(n); return <button key={n} className={on ? 'on' : ''} onClick={() => setSoldOut(s => on ? s.filter(x => x !== n) : [...s, n])}><i>{on && <Icon n="check" s={14} sw={3} />}</i><span>{n}</span>{on && <Badge k="rejected">오늘 품절</Badge>}</button> })}</div>
        <div className="two o-two"><div><div className="o-label">혼밥 자리</div>{Seg({ items: ['여유', '혼잡'], value: solo, set: setSolo })}</div><div><div className="o-label">단체석 (오늘)</div>{Seg({ items: ['가능', '불가'], value: groupOk, set: setGroupOk })}</div></div>
        <div className="card o-row"><b>예약 일시 중지</b><small>바쁠 때 잠깐 받지 않기</small>{Switch({ on: paused, set: setPaused, label: '예약 일시 중지' })}</div>
      </main>
      {TabBar()}
    </>,

    // O-05 마이페이지 · 가게 정보
    my: () => <>
      <StatusBar />
      <main className="scroll gray o-my">
        <div className="o-store"><img src={img('jeongyuk')} alt="" /><div><h1>{STORES[store].name}</h1><small>정육식당 · 광운대역 도보 4분</small><span className="o-ok sm">사업자 확인 완료</span></div></div>
        <div className="o-label">기본 정보</div>
        <div className="card o-info"><div><Icon n="pin" s={18} className="muted" /><span>노원구 광운로 일대 (샘플)</span><button onClick={() => showToast('정보 수정은 「말로 바꾸기」로도 할 수 있어요')}>수정 ›</button></div><div><Icon n="phone" s={17} className="muted" /><span>02-000-0000</span></div></div>
        <div className="o-label">영업시간 · 휴무일</div>
        <div className="card o-hours"><b>{closeEarly ? `오늘만 12:00 – ${closeEarly}` : '매일 12:00 – 24:00'}</b><small>라스트오더 {lastOrder ? '19:30 (오늘만)' : '23:00'} · 휴무일 없음</small></div>
        <div className="o-label">메뉴판</div>
        <div className="card o-menu">{MENU.map(([n, p, im]) => <div key={n}><img src={img(im)} alt="" /><span><b>{n}</b><small>{soldOut.includes(n) ? '오늘 품절' : p}</small></span></div>)}</div>
        <div className="o-label">좌석 · 조리</div>
        <div className="card o-seat">{[['혼밥 바 좌석', `있음 · 6석 (${solo})`], ['단체 최대 인원', groupOk === '가능' ? '30명' : '오늘 불가'], ['평균 조리 시간', '주문 후 8분']].map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div>
        <div className="o-label">더보기</div>
        <div className="card menu-rows">
          <button onClick={() => go('reviews')}>리뷰 관리<span className="o-r"><Badge k="pending">새 리뷰 2</Badge><Icon n="right" s={16} className="muted" /></span></button>
          <button onClick={() => go('alerts')}>알림<Icon n="right" s={16} className="muted" /></button>
          <button onClick={() => go('settings')}>설정<Icon n="right" s={16} className="muted" /></button>
          <button onClick={onExit}>학생 앱으로 보기<Icon n="right" s={16} className="muted" /></button>
        </div>
      </main>
      {TabBar()}
    </>,

    // O-06 리뷰 관리
    reviews: () => <>
      <StatusBar />{Header({ title: '리뷰 관리' })}
      <main className="scroll gray o-reviews">
        <div className="card o-score"><small>방문 후 리뷰</small><div><b>4.8</b><span className="o-stars">{[0, 1, 2, 3, 4].map(i => <Icon key={i} n="star" s={18} fill="currentColor" sw={0} />)}</span><small>리뷰 26 · 이번 주 새 리뷰 2</small></div></div>
        <div className="card o-review"><div className="o-rh"><span className="ava dark">광</span><span><b>광운대 학생</b><em>혼밥</em></span><small>11/12</small></div><span className="o-stars sm">{[0, 1, 2, 3, 4].map(i => <Icon key={i} n="star" s={14} fill="currentColor" sw={0} />)}</span><p>공강 1시간에 딱 맞게 먹고 왔어요. 바 자리가 편해요.</p>
          {replied ? <div className="o-reply"><small>사장님 답글</small><p>{reply}</p></div> : <><textarea rows="2" placeholder="답글을 남겨 주세요" value={reply} onChange={e => setReply(e.target.value)} /><button className="btn soft sm" disabled={!reply.trim()} onClick={() => { setReplied(true); showToast('답글을 남겼어요') }}>답글 달기</button></>}</div>
        <div className="card o-review"><div className="o-rh"><span className="ava">O</span><span><b>OO학과 학생회</b><em>단체 25명</em></span><small>11/06</small></div><span className="o-stars sm">{[0, 1, 2, 3, 4].map(i => <Icon key={i} n="star" s={14} fill="currentColor" sw={0} />)}</span><p>개강총회 예약이 앱으로 바로 돼서 편했어요.</p><div className="o-reply"><small>사장님 답글</small><p>단체 예약 언제든 환영합니다!</p></div></div>
      </main>
    </>,

    // O-07 알림
    alerts: () => <>
      <StatusBar />{Header({ title: '알림' })}
      <main className="scroll gray o-alerts">
        {[['새 예약 요청', `25명 · 목 19:00 · 단체석 · ${fmt(left)} 안에 답해 주세요`, '방금', 'request', 'or'], ['예약금 입금 대기', '개강총회 예약금 200,000원 · 11/12 18:00까지', '10분 전', 'accepted', 'y'], ['선주문 출발', '2명 · 약 7분 후 도착 · 김치찌개 2 조리 시작', '12:21', 'manage', 'g'], ['새 리뷰', '“공강 1시간에 딱 맞게 먹고 왔어요”', '어제', 'reviews', 'gray']].map(([t, d, w, to, c]) => <button key={t} className="card o-alert" onClick={() => go(to)}><i className={c} /><span><b>{t}</b><small>{d}</small></span><em>{w}</em></button>)}
        <div className="o-talk"><span>TALK</span><div><b>카카오 알림톡도 함께 받아요</b><small>앱을 열지 않아도 예약 요청을 놓치지 않아요.<br />받는 번호 010-****-1234</small></div></div>
      </main>
    </>,

    // O-08 설정
    settings: () => <>
      <StatusBar />{Header({ title: '설정' })}
      <main className="scroll gray o-settings">
        <div className="o-label">예약</div>
        <div className="card o-list"><div><b>예약 받기</b>{Switch({ on: accepting, set: setAccepting, label: '예약 받기' })}</div><div><b>하루 최대 단체 예약</b><span className="o-step"><button onClick={() => setMaxGroup(Math.max(0, maxGroup - 1))} aria-label="줄이기">−</button><b>{maxGroup}건</b><button onClick={() => setMaxGroup(maxGroup + 1)} aria-label="늘리기">+</button></span></div><div><b>5분 안에 답이 없으면</b><em className="orange">자동 거절 ›</em></div></div>
        <div className="o-label">혜택 시간</div>
        <div className="card o-list"><div><b>혜택 시간 14:00–17:00</b>{Switch({ on: benefit, set: setBenefit, label: '혜택 시간' })}</div><div><b>30분당 받을 팀 · 혜택 종류</b><em className="muted">3팀 · 음료 ›</em></div></div>
        <div className="o-label">알림</div>
        <div className="card o-list"><div><b>푸시 알림</b>{Switch({ on: push, set: setPush, label: '푸시 알림' })}</div><div><b>카카오 알림톡</b>{Switch({ on: kakao, set: setKakao, label: '카카오 알림톡' })}</div></div>
        <p className="foot">노쇼 규칙: 1회 경고 · 2회 30일 예약 제한 (학생에게 예약 시 안내)</p>
      </main>
    </>,
  }

  return <>
    {screens[page]()}
    {sheet && <div className="sheet-dim" onClick={() => setSheet(null)}><div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-handle" />
      {sheet === 'suggest' && <><b>다른 시간 제안</b><p className="sheet-sub">19:00은 어렵다면, 가능한 시간만 골라 보내세요.</p><div className="o-label dark">11월 13일 (목)</div><div className="o-slots">{['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'].map(t => <button key={t} disabled={t === '19:00'} className={slot === t ? 'on' : ''} onClick={() => setSlot(t)}>{t}</button>)}</div><div className="o-quote g">“19:00은 어렵고 {slot} 가능해요”</div><button className="btn primary" onClick={() => { setReq('suggested'); setSheet(null); showToast(`${slot}으로 제안을 보냈어요`) }}>{slot}으로 제안 보내기</button></>}
      {sheet === 'reject' && <><b>거절 사유를 골라 주세요</b><p className="sheet-sub">학생에게 사유와 함께 근처 다른 가게가 추천돼요.</p><div className="o-slots">{['만석', '재료 소진', '단체 불가'].map(t => <button key={t} className={reason === t ? 'on' : ''} onClick={() => setReason(t)}>{t}</button>)}</div><button className="btn primary o-mt" onClick={() => { setReq('rejected'); setSheet(null); showToast('거절을 보냈어요') }}>거절 보내기</button></>}
      {sheet === 'voice' && <><div className="o-wave"><span>{[14, 26, 18, 32, 22, 12].map((h, i) => <i key={i} style={{ height: h }} />)}</span><em><Icon n="mic" s={26} sw={2.2} /></em><span>{[22, 32, 18, 28, 14, 20].map((h, i) => <i key={i} style={{ height: h }} />)}</span></div><p className="o-said">“오늘 재료 다 떨어져서 3시에 문 닫아요”</p><div className="o-confirm"><small>이렇게 바꿀까요?</small><div><b>오늘 마감 시간</b><span className="o-change big"><s>21:00</s>→<em>15:00</em></span></div><small className="muted">오늘만 적용 · 내일은 원래 영업시간</small></div><div className="two"><button className="btn primary" onClick={() => { setCloseEarly('15:00'); setMode('영업 중'); setSheet(null); showToast('오늘 마감 시간을 15:00으로 바꿨어요') }}>맞아요</button><button className="btn outline" onClick={() => showToast('다시 말씀해 주세요 (시연용)')}>다시 말할게요</button></div></>}
    </div></div>}
    {toast && <div className="toast">{toast}</div>}
  </>
}
