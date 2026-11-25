import {AbsoluteFill, OffthreadVideo, staticFile, interpolate, useCurrentFrame, continueRender, delayRender} from 'remotion';
import {useEffect, useState} from 'react';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('MyeongjoEB', `url(${staticFile('NanumMyeongjoEB.ttf')})`),
      new FontFace('SongMyung', `url(${staticFile('SongMyung.ttf')})`),
    ];
    Promise.all(faces.map((f) => f.load())).then((loaded) => {
      loaded.forEach((f) => document.fonts.add(f));
      continueRender(h);
    });
  }, [h]);
};

export const MyComposition = () => {
  useFonts();
  const f = useCurrentFrame();
  // 먹 번짐: 흐림 20px -> 0, 투명 -> 불투명
  const blur = interpolate(f, [6, 30], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const op = interpolate(f, [6, 30, 66, 78], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = interpolate(f, [6, 78], [1.06, 1.0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo src={staticFile('c02.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 520}}>
        <div style={{fontFamily: 'SongMyung', fontSize: 150, letterSpacing: 10, color: '#F2E6CF',
          opacity: op, filter: `blur(${blur}px)`, transform: `scale(${scale})`,
          textShadow: '0 0 30px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.9)'}}>억울하구나</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
