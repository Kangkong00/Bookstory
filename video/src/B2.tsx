import {AbsoluteFill, Audio, Img, Sequence, staticFile, interpolate, useCurrentFrame, delayRender, continueRender, Easing} from 'remotion';
import {useEffect, useState} from 'react';
import {Intro, INTRO_SEC} from './Intro';
import {random} from 'remotion';

// 1화 「콩쥐팥쥐뎐」 v2(두꺼비 근무 일지) 사진 가편집. 비트 시트: plan/ep01_비트시트_v2.md (v2.1)
export const FPS = 24;
const XF = 6; // 컷 사이 겹침(프레임)
const s = (sec: number) => Math.round(sec * FPS);

type Cap = {at: number; dur: number; lines: string[]; name?: string; big?: boolean; y?: number};
type Shot = {img: string; sec: number; zoom?: [number, number]; origin?: string; sat?: [number, number]; tag?: {text: string; x: number; y: number}; caps: Cap[]; pan?: boolean; sfx?: string; snow?: boolean};

const TOP = 330; // 그림 아래쪽에 주인공이 있을 때 자막을 위로
export const shots: Shot[] = [
  // 기: 원작 그대로
  {img: 'b/B01', sec: 3.0, origin: '60% 55%', tag: {text: '콩쥐', x: 64, y: 20}, caps: [{at: 0.5, dur: 2.45, lines: ['그 독 밑 두꺼비는,', '그 뒤로 어떻게 됐을까?']}]},
  {img: 'b/B02', sec: 3.2, origin: '35% 70%', tag: {text: '두꺼비', x: 37, y: 60}, caps: [{at: 0.2, dur: 2.9, lines: ['밑 빠진 독엔 두꺼비가,'], y: TOP}]},
  {img: 'b/B03', sec: 2.2, origin: '50% 75%', caps: [{at: 0.15, dur: 2.0, lines: ['벼 한 섬엔 참새가,']}]},
  {img: 'b/B04', sec: 2.2, origin: '35% 55%', caps: [{at: 0.15, dur: 2.0, lines: ['돌밭엔 검은 소가.']}]},
  // 승: 두꺼비 시점으로 비틀기 시작
  {img: 'b/B02', sec: 3.0, zoom: [1.55, 1.7], origin: '37% 72%', caps: [{at: 0.2, dur: 2.7, name: '두꺼비', lines: ['그 두꺼비, 나다.', '직업은 구멍 메우기.'], y: TOP}]},
  {img: 'b/B05', sec: 3.0, zoom: [1.9, 2.0], origin: '74% 52%', tag: {text: '팥쥐', x: 48, y: 22}, caps: [{at: 0.4, dur: 2.5, name: '팥쥐', lines: ['엄마! 두꺼비가', '언니 일 다 해 줘!']}]},
  {img: 'v2/N01', sec: 3.4, zoom: [1.25, 1.35], origin: '55% 22%', tag: {text: '계모', x: 52, y: 7}, caps: [{at: 0.5, dur: 2.8, name: '계모', lines: ['오호?', '그렇단 말이지?']}]},
  {img: 'v2/N02', sec: 3.0, origin: '45% 50%', caps: [{at: 0.3, dur: 2.6, name: '계모', lines: ['어디까지 고치나 보자.'], y: 1720}]},
  // 전
  {img: 'v2/N03', sec: 3.0, zoom: [1.0, 1.1], origin: '50% 70%', caps: [{at: 0.6, dur: 2.3, name: '두꺼비', lines: ['…셋?'], big: true, y: TOP}]},
  {img: 'v2/N04', sec: 3.4, caps: [{at: 0.3, dur: 3.0, name: '두꺼비', lines: ['사촌, 육촌까지 불렀다.'], y: TOP}]},
  {img: 'v2/N05', sec: 3.4, origin: '55% 40%', caps: [{at: 0.3, dur: 3.0, name: '두꺼비', lines: ['톡톡…', '여기 금 갔네.']}]},
  // 감정의 바닥
  {img: 'v2/N06', sec: 2.8, zoom: [1.0, 1.1], origin: '50% 72%', sat: [1.0, 0.75], snow: true, caps: [{at: 0.4, dur: 2.3, name: '두꺼비', lines: ['겨울에도…', '퇴근이 없다.'], y: TOP}]},
  {img: 'v2/N07', sec: 3.0, zoom: [1.05, 1.15], origin: '50% 45%', caps: []},
  // 결심(모든 편 공통 장면)
  {img: 'v2/N08', sec: 1.8, zoom: [1.1, 1.2], origin: '60% 40%', caps: [], sfx: 'intro/ting.wav'},
  {img: 'v2/N09', sec: 3.0, zoom: [1.12, 1.0], origin: '50% 40%', caps: [{at: 0.5, dur: 2.4, name: '콩쥐', lines: ['그냥 우리가', '독을 만들면 되잖아!'], y: 1680}]},
  // 결
  {img: 'v2/N10', sec: 1.6, zoom: [1.3, 1.36], origin: '35% 80%', caps: [{at: 0.05, dur: 1.5, lines: ['반년 후'], y: TOP}]},
  {img: 'v2/N11', sec: 4.0, pan: true, caps: []},
  {img: 'v2/N12', sec: 2.2, origin: '45% 45%', caps: [{at: 0.1, dur: 2.0, name: '팥쥐', lines: ['엄마, 빨리 와!', '줄 길어져!']}]},
  {img: 'v2/N13', sec: 2.4, zoom: [1.22, 1.28], origin: '70% 40%', caps: [{at: 0.2, dur: 2.1, name: '두꺼비', lines: ['금 잡는 건,', '우리 담당.'], y: TOP}]},
  {img: 'v2/N14', sec: 2.8, origin: '45% 50%', caps: [{at: 0.5, dur: 2.2, name: '콩쥐', lines: ['다음 분~']}]},
];
const END = 1.6;

const INTRO_F = s(INTRO_SEC);
const OFFSET = INTRO_F - s(0.4); // 인트로 마지막 0.4초는 첫 컷과 겹침
const starts: number[] = [];
let acc = OFFSET;
shots.forEach((sh, i) => { starts[i] = acc; acc += s(sh.sec) - XF; });
const endStart = acc;
export const totalFrames = endStart + s(END);

const HANJI = '#F6EEDF';
const GOLD = '#E9C77B';
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

// 자막 B안 먹띠. 말한 이 표시는 v1보다 1.5배(40 → 60)
const CapB: React.FC<{c: Cap; len: number}> = ({c, len}) => {
  const f = useCurrentFrame();
  const size = c.big ? 92 : 64;
  const lh = size * (c.big ? 1.3 : 1.45);
  const bandH = c.lines.length * lh + (c.name ? 84 : 0) + 260;
  const Y = c.y ?? CAP_Y;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: Y - bandH / 2, height: bandH, opacity: fade(f, len, 6, 6),
        background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.6) 32%, rgba(0,0,0,0.6) 68%, rgba(0,0,0,0))'}} />
      <div style={{position: 'absolute', left: 70, right: 130, top: Y, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        {c.name && <div style={{fontFamily: 'MyeongjoEB', fontSize: 60, color: GOLD, letterSpacing: 8, marginBottom: 14, opacity: fade(f, len, 4, 6)}}>― {c.name} ―</div>}
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

// 이름표: v1보다 1.5배(40 → 60)
const Tag: React.FC<{text: string; x: number; y: number; len: number}> = ({text, x, y, len}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%, ${interpolate(f, [0, 8], [8, 0], clamp)}px)`, opacity: fade(f, len, 6, 8),
      display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{background: 'rgba(20,14,10,0.72)', border: `3px solid ${GOLD}`, borderRadius: 40, padding: '8px 34px 12px', fontFamily: 'MyeongjoEB', fontSize: 60, color: GOLD, letterSpacing: 6}}>{text}</div>
      <div style={{width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: `18px solid ${GOLD}`}} />
    </div>
  );
};

const Still: React.FC<{sh: Shot; len: number}> = ({sh, len}) => {
  const f = useCurrentFrame();
  const [z0, z1] = sh.zoom ?? [1.0, 1.07];
  const sat = sh.sat ? interpolate(f, [0, Math.min(len, s(1.6))], sh.sat, clamp) : 1;
  return (
    <AbsoluteFill style={{opacity: interpolate(f, [0, XF], [0, 1], clamp), overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, len], [z0, z1])})`, transformOrigin: sh.origin ?? '50% 50%', filter: `saturate(${sat})`}}>
        <Img src={staticFile(`${sh.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 가로 사진(N11): 줄을 왼쪽에서 오른쪽으로 빠르게 훑다가 콩쥐 접수대로 줌인
const Pan: React.FC<{sh: Shot; len: number}> = ({sh, len}) => {
  const f = useCurrentFrame();
  const H = 1920;
  const W = Math.round(1376 * (H / 768)); // 3440
  const panEnd = len - s(1.1);
  const x = interpolate(f, [0, panEnd], [0, -(W - 1080)], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const z = interpolate(f, [panEnd - s(0.1), len], [1.0, 1.6], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <AbsoluteFill style={{opacity: interpolate(f, [0, XF], [0, 1], clamp), overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '640px 1180px'}}>
        <Img src={staticFile(`${sh.img}.jpg`)} style={{position: 'absolute', left: x, top: 0, width: W, height: H}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 내리는 눈(정지 사진에 움직임을 줌)
const Snow: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(90).fill(0).map((_, i) => {
        const x0 = random(`sx${i}`) * 1080;
        const sp = 2.2 + random(`sv${i}`) * 3.5;
        const r = 3 + random(`sr${i}`) * 6;
        const y = (random(`sy${i}`) * 2100 + f * sp) % 2100 - 90;
        const x = x0 + Math.sin((f + i * 13) / 18) * 14;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', filter: 'blur(0.6px)'}} />;
      })}
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = (d: number) => interpolate(f - d, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#0d0b09', opacity: interpolate(f, [0, XF], [0, 1], clamp), alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', bottom: 430, textAlign: 'center', fontFamily: 'MyeongjoEB', fontSize: 32, lineHeight: 1.6, color: '#8f8474', opacity: a(10)}}>
        전래동화 「콩쥐팥쥐」를 새롭게 각색한 이야기입니다<br />그림과 영상은 AI(Google Flow)로 만들었습니다
      </div>
    </AbsoluteFill>
  );
};

export const B2: React.FC = () => {
  useFonts();
  const iCold = shots.findIndex((x) => x.img === 'v2/N06');
  const iSpring = shots.findIndex((x) => x.img === 'v2/N10');
  const dipA = starts[iCold];
  const dipB = starts[iSpring];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shots.map((sh, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s(sh.sec)}>
          {sh.pan ? <Pan sh={sh} len={s(sh.sec)} /> : <Still sh={sh} len={s(sh.sec)} />}
          {sh.snow && <Snow />}
          {sh.tag && <Tag {...sh.tag} len={s(Math.min(2.2, sh.sec))} />}
          {sh.caps.map((c, k) => (
            <Sequence key={k} from={s(c.at)} durationInFrames={s(c.dur)}>
              <CapB c={c} len={s(c.dur)} />
            </Sequence>
          ))}
          {sh.sfx && <Audio src={staticFile(sh.sfx)} volume={0.55} />}
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={INTRO_F}><Intro title={'콩쥐\n팥쥐뎐'} seal="엇" /></Sequence>
      <Sequence from={endStart} durationInFrames={s(END)}>
        <End />
        <Sequence from={s(0.25)}><Audio src={staticFile('intro/stamp.wav')} volume={0.9} /></Sequence>
      </Sequence>
      <Sequence from={OFFSET - s(0.2)}>
        <Audio src={staticFile('amb66.mp3')} volume={(f) => {
          const g = f + OFFSET - s(0.2);
          return interpolate(g, [OFFSET - s(0.2), OFFSET + 10, dipA - 6, dipA + 10, dipB - 4, dipB + 6, totalFrames - 30, totalFrames], [0, 0.85, 0.85, 0.3, 0.3, 0.9, 0.9, 0], clamp);
        }} />
      </Sequence>
    </AbsoluteFill>
  );
};
