import {AbsoluteFill, Audio, Img, Sequence, staticFile, interpolate, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {useEffect, useState} from 'react';

// 1화 B안 사진 가편집 (영상 컷 4개도 지금은 사진으로)
export const FPS = 24;
const XF = 6; // 컷 사이 겹침
const s = (sec: number) => Math.round(sec * FPS);

type Cap = {at: number; dur: number; lines: string[]; name?: string; big?: boolean; y?: number};
type Shot = {img: string; sec: number; zoom?: [number, number]; origin?: string; sat?: [number, number]; tag?: {text: string; x: number; y: number}; caps: Cap[]; vid?: boolean};

export const shots: Shot[] = [
  // 기
  {img: 'B01', sec: 3.2, vid: true, origin: '60% 55%', tag: {text: '콩쥐', x: 64, y: 20}, caps: [{at: 0.2, dur: 3, lines: ['왜 콩쥐만', '도우미가 있었을까?']}]},
  {img: 'B02', sec: 3.4, origin: '35% 70%', caps: [{at: 0.2, dur: 3.1, lines: ['밑 빠진 독엔 두꺼비가,'], y: 360}]},
  {img: 'B03', sec: 3.3, origin: '50% 75%', caps: [{at: 0.2, dur: 3, lines: ['벼 한 섬엔 참새가,']}]},
  {img: 'B04', sec: 3.3, origin: '35% 55%', caps: [{at: 0.2, dur: 3, lines: ['돌밭엔 검은 소가.']}]},
  // 승
  {img: 'B05', sec: 3.8, origin: '60% 50%', tag: {text: '팥쥐', x: 59, y: 38}, caps: [{at: 0.6, dur: 3.1, name: '팥쥐', lines: ['왜 언니만?']}]},
  {img: 'B06', sec: 3.6, origin: '55% 55%', caps: [{at: 0.2, dur: 3.3, name: '쥐', lines: ['팥쥐 편 도우미, 여기 있소!']}]},
  {img: 'B07', sec: 3.0, origin: '50% 35%', caps: [{at: 0.2, dur: 2.7, lines: ['그렇게 팥쥐에게도', '편이 생겼다.']}]},
  // 전
  {img: 'B08', sec: 5.0, vid: true, origin: '55% 65%', caps: [{at: 0.1, dur: 2.4, lines: ['그런데,', '팥쥐 편도 가만있지 않았다.']}, {at: 2.6, dur: 2.3, name: '쥐', lines: ['구멍은 내가 뚫고!']}]},
  {img: 'B09', sec: 4.6, vid: true, origin: '40% 45%', caps: [{at: 0.1, dur: 2.2, name: '까마귀', lines: ['곡식은 내가 가져가고!']}, {at: 2.4, dur: 2.1, lines: ['하늘까지 번진', '도우미 대전.']}]},
  {img: 'B10a', sec: 2.1, origin: '55% 30%', caps: [{at: 0.1, dur: 2.0, name: '족제비', lines: ['호미는 내가 숨겼…']}]},
  {img: 'B10b', sec: 2.2, zoom: [1.0, 1.12], origin: '70% 52%', caps: [{at: 0.15, dur: 2.0, name: '족제비', lines: ['…어?'], big: true}]},
  // 감정의 바닥
  {img: 'B12a', sec: 3.4, zoom: [1.0, 1.05], origin: '50% 55%', caps: [{at: 0.3, dur: 3.0, lines: ['정작 넘어진 팥쥐는,', '아무도 보지 않았다.']}]},
  {img: 'B12b', sec: 4.2, zoom: [1.0, 1.2], origin: '50% 32%', sat: [0.85, 0.5], caps: [{at: 1.0, dur: 3.1, name: '팥쥐', lines: ['…내 편이라며.']}]},
  {img: 'B13', sec: 4.4, origin: '50% 55%', sat: [0.5, 1.0], caps: [{at: 1.0, dur: 3.3, name: '콩쥐', lines: ['괜찮아?']}]},
  {img: 'B14', sec: 3.6, zoom: [1.06, 1.0], origin: '50% 55%', caps: [{at: 0.4, dur: 3.1, lines: ['내 편은,', '바로 옆에 있었다.']}]},
  // 결
  {img: 'B15b', sec: 2.0, origin: '50% 50%', caps: []},
  {img: 'B15c', sec: 2.0, origin: '50% 70%', caps: []},
  {img: 'B15a', sec: 5.4, vid: true, zoom: [1.08, 1.0], origin: '50% 60%', caps: [{at: 0.8, dur: 4.5, lines: ['밑 빠진 독도,', '둘이면 찼다.'], y: 330}]},
];
const END = 3.2;

const starts: number[] = [];
let acc = 0;
shots.forEach((sh, i) => { starts[i] = acc; acc += s(sh.sec) - XF; });
const endStart = acc;
export const totalFrames = endStart + s(END);

const HANJI = '#F6EEDF';
const GOLD = '#E9C77B';
const SEAL = '#A83A26';
const CAP_Y = 1400;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fade = (f: number, len: number, a = 6, b = 6) => interpolate(f, [0, a, len - b, len], [0, 1, 1, 0], clamp);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [new FontFace('MyeongjoEB', `url(${staticFile('NanumMyeongjoEB.ttf')})`), new FontFace('SongMyung', `url(${staticFile('SongMyung.ttf')})`)];
    Promise.all(faces.map((x) => x.load())).then((l) => { l.forEach((x) => document.fonts.add(x)); continueRender(h); });
  }, [h]);
};

const CapB: React.FC<{c: Cap; len: number}> = ({c, len}) => {
  const f = useCurrentFrame();
  const size = c.big ? 92 : 64;
  const lh = size * (c.big ? 1.3 : 1.45);
  const bandH = c.lines.length * lh + (c.name ? 62 : 0) + 260;
  const Y = c.y ?? CAP_Y;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: Y - bandH / 2, height: bandH, opacity: fade(f, len, 6, 6),
        background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.6) 32%, rgba(0,0,0,0.6) 68%, rgba(0,0,0,0))'}} />
      <div style={{position: 'absolute', left: 70, right: 130, top: Y, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        {c.name && <div style={{fontFamily: 'MyeongjoEB', fontSize: 40, color: GOLD, letterSpacing: 6, marginBottom: 14, opacity: fade(f, len, 4, 6)}}>― {c.name} ―</div>}
        {c.lines.map((t, i) => {
          const g = f - i * 5;
          return (
            <div key={i} style={{fontFamily: 'MyeongjoEB', fontSize: size, lineHeight: `${lh}px`, letterSpacing: c.big ? 8 : 2, color: HANJI, whiteSpace: 'nowrap',
              opacity: interpolate(g, [0, 7], [0, 1], clamp) * fade(f, len, 1, 6),
              transform: `translateY(${interpolate(g, [0, 9], [10, 0], clamp)}px)`,
              textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>{t}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Tag: React.FC<{text: string; x: number; y: number; len: number}> = ({text, x, y, len}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%, ${interpolate(f, [0, 8], [8, 0], clamp)}px)`, opacity: fade(f, len, 6, 8),
      display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{background: 'rgba(20,14,10,0.72)', border: `2px solid ${GOLD}`, borderRadius: 30, padding: '6px 24px 8px', fontFamily: 'MyeongjoEB', fontSize: 40, color: GOLD, letterSpacing: 4}}>{text}</div>
      <div style={{width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `12px solid ${GOLD}`}} />
    </div>
  );
};

const Still: React.FC<{sh: Shot; len: number; first: boolean}> = ({sh, len, first}) => {
  const f = useCurrentFrame();
  const [z0, z1] = sh.zoom ?? [1.0, 1.07];
  const sat = sh.sat ? interpolate(f, [0, Math.min(len, s(1.6))], sh.sat, clamp) : 1;
  return (
    <AbsoluteFill style={{opacity: first ? 1 : interpolate(f, [0, XF], [0, 1], clamp), overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, len], [z0, z1])})`, transformOrigin: sh.origin ?? '50% 50%', filter: `saturate(${sat})`}}>
        <Img src={staticFile(`b/${sh.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = (d: number) => interpolate(f - d, [0, 12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#0d0b09', opacity: interpolate(f, [0, XF], [0, 1], clamp), alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: 'MyeongjoEB', fontSize: 44, color: '#bfb3a0', letterSpacing: 6, opacity: a(3)}}>옛이야기, 뒷장을 넘기다</div>
      <div style={{fontFamily: 'SongMyung', fontSize: 120, color: HANJI, letterSpacing: 8, marginTop: 30, opacity: a(8)}}>팥쥐의 편</div>
      <div style={{width: 110, height: 110, marginTop: 36, background: SEAL, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'MyeongjoEB', fontSize: 50, color: '#F7EDE0', opacity: a(16), transform: `scale(${interpolate(a(16), [0, 1], [1.5, 1])}) rotate(-4deg)`}}>끝</div>
      <div style={{position: 'absolute', bottom: 430, textAlign: 'center', fontFamily: 'MyeongjoEB', fontSize: 32, lineHeight: 1.6, color: '#8f8474', opacity: a(22)}}>
        전래동화 「콩쥐팥쥐」를 새롭게 각색한 이야기입니다<br />그림과 영상은 AI(Google Flow)로 만들었습니다
      </div>
    </AbsoluteFill>
  );
};

export const B1: React.FC = () => {
  useFonts();
  const i12b = shots.findIndex((x) => x.img === 'B12b');
  const i13 = shots.findIndex((x) => x.img === 'B13');
  const dipA = starts[i12b];
  const dipB = starts[i13] + s(0.8);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shots.map((sh, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s(sh.sec)}>
          <Still sh={sh} len={s(sh.sec)} first={i === 0} />
          {sh.tag && <Tag {...sh.tag} len={s(Math.min(2.2, sh.sec))} />}
          {sh.caps.map((c, k) => (
            <Sequence key={k} from={s(c.at)} durationInFrames={s(c.dur)}>
              <CapB c={c} len={s(c.dur)} />
            </Sequence>
          ))}
          {sh.vid && (
            <div style={{position: 'absolute', top: 40, left: 40, fontFamily: 'MyeongjoEB', fontSize: 30, color: '#fff', background: 'rgba(0,0,0,0.55)', padding: '4px 14px', borderRadius: 8}}>영상 예정</div>
          )}
        </Sequence>
      ))}
      <Sequence from={endStart} durationInFrames={s(END)}><End /></Sequence>
      <Audio src={staticFile('amb66.mp3')} volume={(f) => interpolate(f, [0, 12, dipA - 6, dipA + 8, dipB, dipB + 20, totalFrames - 30, totalFrames], [0, 0.9, 0.9, 0.15, 0.15, 0.9, 0.9, 0], clamp)} />
    </AbsoluteFill>
  );
};
