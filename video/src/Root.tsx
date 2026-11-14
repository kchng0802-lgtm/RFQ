import {Composition} from 'remotion';
import {Main} from './Main';

export const FPS = 30;

export const Root = () => (
  <Composition id="Main" component={Main} durationInFrames={FPS * 6} fps={FPS} width={1920} height={1080} />
);
