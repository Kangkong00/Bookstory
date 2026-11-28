import {AbsoluteFill, Audio, Img, Sequence, staticFile, interpolate, useCurrentFrame, delayRender, continueRender, random, Easing} from 'remotion';
import {useEffect, useState} from 'react';

// 엇이야기 공통 인트로: 한지 + 큰 붓글씨 제목이 징 소리와 함께 찍힘 + 붉은 직인 + 먼지 → 서서히 사라짐
export const INTRO_FPS = 24;
export const INTRO_SEC = 1.6; // 인트로 길이(본편 첫 컷과 마지막 0.4초 겹침)
const F = (sec: number) => Math.round(sec * INTRO_FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useIntroFonts = () => {
  const [h] = useState(() => delayRender('intro-fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('IntroBrush', `url(${staticFile('intro/EastSeaDokdo-Regular.ttf')})`),
      new FontFace('SongMyung', `url(${staticFile('SongMyung.ttf')})`),
    ];
    Promise.all(faces.map((x) => x.load())).then((l) => { l.forEach((x) => document.fonts.add(x)); continueRender(h); });
  }, [h]);
};

const Dust: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame() - start;
  if (f < 0) return null;
  const n = 46;
  return (
    <AbsoluteFill>
      {new Array(n).fill(0).map((_, i) => {
        const ang = random(`a${i}`) * Math.PI * 2;
        const sp = 6 + random(`s${i}`) * 22;
        const life = F(0.9) + random(`l${i}`) * F(0.6);
        const t = Math.min(f / life, 1);
        const dist = sp * f * (1 - t * 0.45);
        const x = 540 + Math.cos(ang) * (260 + dist) * 1.25;
        const y = 860 + Math.sin(ang) * (90 + dist * 0.6) - f * 1.4;
        const size = 3 + random(`z${i}`) * 9;
        const op = interpolate(t, [0, 0.15, 1], [0, 0.55, 0], clamp);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
          background: 'rgba(120,98,70,1)', opacity: op, filter: 'blur(1.5px)'}} />;
      })}
    </AbsoluteFill>
  );
};

const Puff: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame() - start;
  if (f < 0) return null;
  return (
    <AbsoluteFill>
      {new Array(9).fill(0).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x0 = 540 + side * (120 + random(`px${i}`) * 380);
        const y0 = 900 + (random(`py${i}`) - 0.5) * 120;
        const r = 70 + random(`pr${i}`) * 90 + f * 4;
        const op = interpolate(f, [0, 3, 22], [0, 0.32, 0], clamp);
        return <div key={i} style={{position: 'absolute', left: x0 + side * f * 3 - r, top: y0 - f * 1.2 - r * 0.5, width: r * 2, height: r,
          borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(170,145,110,0.9), rgba(170,145,110,0) 70%)', opacity: op}} />;
      })}
    </AbsoluteFill>
  );
};

export const Intro: React.FC<{title: string; seal: string}> = ({title, seal}) => {
  useIntroFonts();
  const f = useCurrentFrame();
  const hit = F(0.12); // 제목이 찍히는 순간
  const sealAt = F(0.62);
  const out = F(INTRO_SEC) - F(0.4);

  // 제목: 위에서 크게 떨어져 쾅 하고 찍힘
  const sc = interpolate(f, [0, hit], [1.6, 1.0], {...clamp, easing: Easing.in(Easing.quad)});
  const tOp = interpolate(f, [0, hit * 0.6], [0, 1], clamp);
  // 찍히는 순간 화면 흔들림
  const shakeK = interpolate(f, [hit, hit + 6], [1, 0], clamp);
  const sx = Math.sin(f * 2.3) * 10 * shakeK;
  const sy = Math.cos(f * 3.1) * 8 * shakeK;
  // 직인
  const sSc = interpolate(f, [sealAt - 3, sealAt], [1.8, 1.0], {...clamp, easing: Easing.in(Easing.quad)});
  const sOp = interpolate(f, [sealAt - 3, sealAt - 1], [0, 1], clamp);
  // 전체 페이드 아웃
  const allOp = interpolate(f, [out, F(INTRO_SEC)], [1, 0], clamp);

  return (
    <AbsoluteFill style={{opacity: allOp}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        <Img src={staticFile('intro/hanji.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.04)'}} />
        {/* 먹 번짐 그림자 */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: 'IntroBrush', fontSize: 330,
          color: 'rgba(40,28,18,0.22)', filter: 'blur(10px)', opacity: tOp, transform: `scale(${sc * 1.02})`}}>{title}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: 'IntroBrush', fontSize: 330,
          color: '#1B1410', letterSpacing: -4, opacity: tOp, transform: `scale(${sc})`, textShadow: '0 2px 1px rgba(0,0,0,0.25)'}}>{title}</div>
        {/* 직인: 제목 오른쪽 아래 */}
        <div style={{position: 'absolute', left: 846, top: 1030, width: 140, height: 140, opacity: sOp * 0.93,
          transform: `scale(${sSc}) rotate(-4deg)`, background: '#B0301F', borderRadius: 10,
          boxShadow: 'inset 0 0 0 7px #B0301F, inset 0 0 0 11px rgba(246,232,210,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{fontFamily: 'SongMyung', fontSize: 98, color: '#F6E8D2', lineHeight: 1, marginTop: -6}}>{seal}</span>
        </div>
        <Puff start={hit} />
        <Dust start={hit} />
      </AbsoluteFill>
      <Sequence from={hit - 1}><Audio src={staticFile('intro/gong.wav')} volume={0.9} /></Sequence>
      <Sequence from={sealAt - 1}><Audio src={staticFile('intro/stamp.wav')} volume={0.7} /></Sequence>
    </AbsoluteFill>
  );
};

// 시안 확인용: 인트로 → 본편 첫 컷(B01)으로 넘어가는 3초
export const IntroPreview: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, F(3)], [1.08, 1.0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <Img src={staticFile('b/B01.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <Sequence durationInFrames={F(INTRO_SEC)}><Intro title="콩쥐팥쥐뎐" seal="엇" /></Sequence>
    </AbsoluteFill>
  );
};
