import {AbsoluteFill} from 'remotion';
// import {Audio, staticFile} from 'remotion';  // drop an mp3 in public/ then: <Audio src={staticFile('music.mp3')} />
import type {Caption} from '@remotion/captions';
import {Scene3D} from './Scene3D';
import {Captions} from './Captions';

const captions: Caption[] = [
  {text: 'Hello, 3D world', startMs: 500, endMs: 2500, timestampMs: 1500, confidence: 1},
  {text: 'Three.js + Remotion', startMs: 2500, endMs: 5500, timestampMs: 4000, confidence: 1},
];

export const Main = () => (
  <AbsoluteFill>
    <Scene3D />
    <Captions captions={captions} />
  </AbsoluteFill>
);
