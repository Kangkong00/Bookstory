import {Composition} from 'remotion';
import {MyComposition} from './Composition';
import {Shorts, FPS, totalFrames} from './Shorts';
import {Sample} from './Sample';
import {B1, totalFrames as b1Frames} from './B1';
import {IntroPreview} from './Intro';
import {B2, totalFrames as b2Frames} from './B2';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Test" component={MyComposition} durationInFrames={84} fps={24} width={1080} height={1920} />
      <Composition id="Ep01" component={Shorts} durationInFrames={totalFrames} fps={FPS} width={1080} height={1920} />
      <Composition id="Sample" component={Sample} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{style: 'A', scene: 0}} />
      <Composition id="B1" component={B1} durationInFrames={b1Frames} fps={24} width={1080} height={1920} />
      <Composition id="B2" component={B2} durationInFrames={b2Frames} fps={24} width={1080} height={1920} />
      <Composition id="IntroPreview" component={IntroPreview} durationInFrames={96} fps={24} width={1080} height={1920} />
    </>
  );
};
