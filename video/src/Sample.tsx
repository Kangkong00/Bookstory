import {AbsoluteFill, Img, staticFile, delayRender, continueRender} from 'remotion';
import {useEffect, useState} from 'react';

const scenes = [
  {bg: 'bg1.jpg', name: '', lines: ['콩쥐에게 두꺼비가 있었다면,'], hi: ''},
  {bg: 'bg2.jpg', name: '족제비', lines: ['...호미는 벌써 숨겼는데?'], hi: '호미'},
  {bg: 'c07.jpg', name: '물', lines: ['너는 우리 편이 아니었다.', '우리 손이었지.'], hi: '우리 손'},
];
const Y = 1400; // 모든 자막의 기준 위치(화면 아래쪽 1/3, 쇼츠 하단 UI 위)

const useFonts = () => {
  const [h] = useState(() => delayRender('f'));
  useEffect(() => {
    const f = new FontFace('MyeongjoEB', `url(${staticFile('NanumMyeongjoEB.ttf')})`);
    f.load().then((x) => { document.fonts.add(x); return document.fonts.load("900 40px 'Noto Sans CJK KR'"); }).then(() => continueRender(h));
  }, [h]);
};

const mark = (t: string, hi: string, color: string) => {
  if (!hi || !t.includes(hi)) return t;
  const [a, b] = t.split(hi);
  return <>{a}<span style={{color}}>{hi}</span>{b}</>;
};

export const Sample: React.FC<{style: string; scene: number}> = ({style, scene}) => {
  useFonts();
  const s = scenes[scene];
  const wrap: React.CSSProperties = {position: 'absolute', left: 90, right: 130, top: Y, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', wordBreak: 'keep-all'};
  let body: React.ReactNode = null;
  if (style === 'A') {
    const t: React.CSSProperties = {fontFamily: 'MyeongjoEB', fontSize: 68, lineHeight: 1.4, color: '#fff', WebkitTextStroke: '9px rgba(10,8,6,0.88)', paintOrder: 'stroke fill', textShadow: '0 4px 14px rgba(0,0,0,0.6)'};
    body = <div style={wrap}>
      {s.name && <div style={{...t, fontSize: 48, color: '#E9C77B', WebkitTextStroke: '7px rgba(10,8,6,0.88)', marginBottom: 6}}>{s.name}</div>}
      {s.lines.map((l, i) => <div key={i} style={t}>{l}</div>)}
    </div>;
  }
  if (style === 'B') {
    body = <>
      <div style={{position: 'absolute', left: 0, right: 0, top: Y - 200, height: 400, background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.62) 30%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0))'}} />
      <div style={wrap}>
        {s.name && <div style={{fontFamily: 'MyeongjoEB', fontSize: 40, color: '#E9C77B', letterSpacing: 6, marginBottom: 14}}>― {s.name} ―</div>}
        {s.lines.map((l, i) => <div key={i} style={{fontFamily: 'MyeongjoEB', fontSize: 64, lineHeight: 1.45, color: '#F6EEDF', letterSpacing: 2}}>{l}</div>)}
      </div>
    </>;
  }
  if (style === 'C') {
    const t: React.CSSProperties = {fontFamily: "'Noto Sans CJK KR'", fontWeight: 900, fontSize: 70, lineHeight: 1.3, wordBreak: 'keep-all', color: '#fff', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', letterSpacing: -1};
    body = <div style={wrap}>
      {s.name && <div style={{fontFamily: "'Noto Sans CJK KR'", fontWeight: 900, fontSize: 40, color: '#111', background: '#FFD54A', padding: '6px 22px', borderRadius: 40, marginBottom: 16}}>{s.name}</div>}
      {s.lines.map((l, i) => <div key={i} style={t}>{mark(l, s.hi, '#FFD54A')}</div>)}
    </div>;
  }
  if (style === 'D') {
    body = <div style={wrap}>
      <div style={{position: 'relative', background: 'rgba(239,227,200,0.94)', borderRadius: 10, padding: s.name ? '40px 44px 30px' : '30px 44px', boxShadow: '0 8px 28px rgba(0,0,0,0.5)', border: '2px solid rgba(120,90,50,0.35)'}}>
        {s.name && <div style={{position: 'absolute', top: -30, left: 30, background: '#A83A26', color: '#F7EDE0', fontFamily: 'MyeongjoEB', fontSize: 38, padding: '6px 18px 8px', borderRadius: 5, transform: 'rotate(-3deg)'}}>{s.name}</div>}
        {s.lines.map((l, i) => <div key={i} style={{fontFamily: 'MyeongjoEB', fontSize: 58, lineHeight: 1.45, color: '#1E1A15'}}>{l}</div>)}
      </div>
    </div>;
  }
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile(s.bg)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {body}
      <div style={{position: 'absolute', top: 40, left: 40, fontFamily: "'Noto Sans CJK KR'", fontWeight: 900, fontSize: 64, color: '#fff', background: 'rgba(0,0,0,0.75)', padding: '4px 26px', borderRadius: 12}}>{style}</div>
    </AbsoluteFill>
  );
};
