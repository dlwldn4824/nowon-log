// 실제 기기 상단(노치·상태바) 영역만큼 띄우는 여백
export function StatusBar({ light }) {
  return <div className={'statusbar' + (light ? ' light' : '')} aria-hidden="true" />
}
