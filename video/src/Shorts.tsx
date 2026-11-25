import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import {useEffect, useState} from 'react';

// ---- 편집 데이터 (편마다 이 부분만 바꾼다) ----
export const FPS = 24;
export const XF = 10;         // 컷 사이 겹침(프레임)
type Item = {kind: 'video'; src: string; len: number; vol?: number}
  | {kind: 'still'; src: string; len: number; water?: [number, number]; fog?: [number, number]}
  | {kind: 'end'; len: number};
export const items: Item[] = [
  {kind: 'video', src: 'c01.mp4', len: 190},
  {kind: 'video', src: 'c02.mp4', len: 190},
  {kind: 'video', src: 'c03.mp4', len: 190},
  {kind: 'video', src: 'c04.mp4', len: 190},
  {kind: 'video', src: 'c05.mp4', len: 190},
  {kind: 'video', src: 'c06.mp4', len: 190, vol: 0.8},
  {kind: 'still', src: 'c07.jpg', len: 180, water: [60, 100], fog: [0, 45]},
  {kind: 'still', src: 'c08.jpg', len: 190, fog: [0, 40]},
  {kind: 'end', len: 84},
];

type Cap =
  | {kind: 'narr'; clip: number; from: number; to: number; lines: string[]; top?: number}
  | {kind: 'key'; clip: number; from: number; to: number; lines: string[]; y?: number; size?: number}
  | {kind: 'dlg'; clip: number; from: number; to: number; name: string; text: string; top?: number};

export const caps: Cap[] = [
  {kind: 'narr', clip: 0, from: 8, to: 86, lines: ['콩쥐에게 두꺼비가 있었다면,']},
  {kind: 'narr', clip: 0, from: 90, to: 178, lines: ['팥쥐에게는?']},
  {kind: 'key', clip: 1, from: 26, to: 176, lines: ['억울하구나']},
  {kind: 'dlg', clip: 2, from: 8, to: 54, name: '쥐', text: '독은 내가!'},
  {kind: 'dlg', clip: 2, from: 56, to: 104, name: '까마귀', text: '곡식은 내가!'},
  {kind: 'dlg', clip: 2, from: 106, to: 180, name: '족제비', text: '...호미는 벌써 숨겼는데?'},
  {kind: 'dlg', clip: 3, from: 10, to: 70, name: '쥐', text: '넌... 또 뭐냐?'},
  {kind: 'narr', clip: 3, from: 78, to: 186, lines: ['그 두꺼비는,', '이 집을 지키는 신령이었다.']},
  {kind: 'narr', clip: 4, from: 12, to: 110, lines: ['하늘과 물의 싸움.']},
  {kind: 'key', clip: 5, from: 40, to: 116, lines: ['지금이다']},
  {kind: 'key', clip: 6, from: 18, to: 176, lines: ['너는 우리 편이 아니었다.', '우리 손이었지.']},
  {kind: 'narr', clip: 7, from: 14, to: 186, lines: ['두 아이를 부린 쪽들의 이름은', '제목 어디에도 남지 않았다.']},
];
const starts: number[] = [];
items.reduce((acc, it, i) => { starts[i] = acc; return acc + it.len - XF; }, 0);
export const totalFrames = starts[items.length - 1] + items[items.length - 1].len;
const start = (i: number) => starts[i];

// ---- 색·글꼴 ----
const HANJI = '#F2E6CF';
const SEAL = '#A83A26';
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('MyeongjoEB', `url(${staticFile('NanumMyeongjoEB.ttf')})`),
      new FontFace('SongMyung', `url(${staticFile('SongMyung.ttf')})`),
    ];
    Promise.all(faces.map((f) => f.load())).then((l) => {
      l.forEach((f) => document.fonts.add(f));
      continueRender(h);
    });
  }, [h]);
};
const fade = (f: number, len: number, a = 6, b = 6) =>
  interpolate(f, [0, a, len - b, len], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// ---- 자막 B안(먹띠): 위치·체계 통일 ----
const CAP_Y = 1400;          // 자막 중심선(쇼츠 하단 UI 위)
const GOLD = '#E9C77B';
const CapB: React.FC<{lines: string[]; len: number; name?: string; big?: boolean; mid?: boolean}> = ({lines, len, name, big, mid}) => {
  const f = useCurrentFrame();
  const size = big ? 92 : mid ? 68 : 64;
  const lh = size * (big ? 1.32 : 1.45);
  const textH = lines.length * lh + (name ? 62 : 0);
  const bandH = textH + 260;
  const bandOp = fade(f, len, 8, 8);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: CAP_Y - bandH / 2, height: bandH, opacity: bandOp,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.62) 32%, rgba(0,0,0,0.62) 68%, rgba(0,0,0,0))'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: CAP_Y, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        {name && <div style={{fontFamily: 'MyeongjoEB', fontSize: 40, color: GOLD, letterSpacing: 6, marginBottom: 14, opacity: fade(f, len, 5, 8)}}>― {name} ―</div>}
        {lines.map((t, i) => {
          const g = f - i * (big ? 14 : 6);
          const blur = big ? interpolate(g, [0, 22], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
          const out = interpolate(f, [len - 10, len], [0, big ? 8 : 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{fontFamily: 'MyeongjoEB', fontSize: size, lineHeight: `${lh}px`, letterSpacing: big ? 8 : 2, color: big ? '#F6EEDF' : '#F6EEDF',
              whiteSpace: 'nowrap', opacity: interpolate(g, [0, big ? 16 : 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * fade(f, len, 1, 8),
              transform: `translateY(${interpolate(g, [0, 10], [big ? 0 : 10, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
              filter: blur + out ? `blur(${blur + out}px)` : undefined,
              textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>{t}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{src: string; len: number; first: boolean; vol: number}> = ({src, len, first, vol}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, XF], [first ? 1 : 0, 1], {extrapolateRight: 'clamp'});
  const vout = interpolate(f, [len - XF, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op}}>
      <OffthreadVideo src={staticFile(src)} volume={op * vout * vol} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// 사진 컷: 천천히 다가가기 + 수면 일렁임 + 안개 흐름
const Still: React.FC<{src: string; len: number; idx: number; water?: [number, number]; fog?: [number, number]}> = ({src, len, idx, water, fog}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, XF], [0, 1], {extrapolateRight: 'clamp'});
  const scale = interpolate(f, [0, len], [1.0, 1.1]);
  const img = {position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const};
  const id = `rip${idx}`;
  return (
    <AbsoluteFill style={{opacity: op, overflow: 'hidden'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={`0.004 ${0.045 + 0.004 * Math.sin(f / 9)}`} numOctaves={2} seed={3} result="n">
          </feTurbulence>
          <feOffset in="n" dx="0" dy={f * 0.8} result="m" />
          <feDisplacementMap in="SourceGraphic" in2="m" scale={14} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '50% 45%'}}>
        <img src={staticFile(src)} style={img} />
        {water && (
          <img src={staticFile(src)} style={{...img, filter: `url(#${id})`,
            clipPath: `inset(${water[0]}% 0 ${100 - water[1]}% 0)`,
            WebkitMaskImage: `linear-gradient(to bottom, transparent ${water[0]}%, black ${water[0] + 4}%)`}} />
        )}
      </AbsoluteFill>
      {fog && [0, 1].map((k) => (
        <div key={k} style={{position: 'absolute', left: -400, width: 1880, top: `${fog[0]}%`, height: `${fog[1] - fog[0] + 10}%`,
          transform: `translateX(${(k ? -1 : 1) * (f * 1.1 - 100)}px)`, opacity: 0.22 + 0.08 * Math.sin(f / 30 + k * 2),
          background: `radial-gradient(ellipse ${k ? '50% 40%' : '60% 50%'} at ${k ? 35 : 65}% 50%, rgba(225,230,235,0.75), rgba(225,230,235,0) 70%)`,
          filter: 'blur(30px)'}} />
      ))}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};

// 끝 화면
const End: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const a = (d: number) => interpolate(f - d, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#0d0b09', opacity: interpolate(f, [0, XF], [0, 1], {extrapolateRight: 'clamp'}),
      alignItems: 'center', justifyContent: 'center', gap: 0}}>
      <div style={{fontFamily: 'MyeongjoEB', fontSize: 44, color: '#bfb3a0', letterSpacing: 6, opacity: a(4)}}>옛이야기, 물밑에서 다시 읽다</div>
      <div style={{fontFamily: 'SongMyung', fontSize: 132, color: HANJI, letterSpacing: 10, marginTop: 34, opacity: a(10),
        filter: `blur(${interpolate(f - 10, [0, 20], [14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`}}>물밑의 편</div>
      <div style={{width: 120, height: 120, marginTop: 40, background: SEAL, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'MyeongjoEB', fontSize: 54, color: '#F7EDE0', opacity: a(22), transform: `scale(${interpolate(a(22), [0, 1], [1.5, 1])}) rotate(-4deg)`}}>끝</div>
      <div style={{position: 'absolute', bottom: 430, textAlign: 'center', fontFamily: 'MyeongjoEB', fontSize: 34, lineHeight: 1.6, color: '#8f8474', opacity: a(30)}}>
        전래동화 「콩쥐팥쥐」를 새롭게 각색한 이야기입니다<br />그림과 영상은 AI(Google Flow)로 만들었습니다
      </div>
    </AbsoluteFill>
  );
};

export const Shorts: React.FC = () => {
  useFonts();
  const sIdx = items.findIndex((it) => it.kind !== 'video');
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {items.map((it, i) => (
        <Sequence key={i} from={start(i)} durationInFrames={it.len}>
          {it.kind === 'video' && <Clip src={it.src} len={it.len} first={i === 0} vol={it.vol ?? 1} />}
          {it.kind === 'still' && <Still src={it.src} len={it.len} idx={i} water={it.water} fog={it.fog} />}
          {it.kind === 'end' && <End len={it.len} />}
        </Sequence>
      ))}
      <Sequence from={start(sIdx)} durationInFrames={totalFrames - start(sIdx)}>
        <Audio src={staticFile('amb.wav')} volume={(f) => interpolate(f, [0, XF, totalFrames - start(sIdx) - 30, totalFrames - start(sIdx)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      </Sequence>
      {caps.map((c, i) => {
        const from = start(c.clip) + c.from;
        const len = c.to - c.from;
        return (
          <Sequence key={'c' + i} from={from} durationInFrames={len}>
            {c.kind === 'narr' && <CapB lines={c.lines} len={len} />}
            {c.kind === 'key' && <CapB name={c.clip >= 5 ? '물' : undefined} lines={c.lines} len={len} big={c.lines.length === 1} mid={c.lines.length > 1} />}
            {c.kind === 'dlg' && <CapB name={c.name} lines={[c.text]} len={len} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
