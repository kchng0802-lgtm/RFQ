import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';

// Pass captions in the @remotion/captions format ({text, startMs, endMs, timestampMs, confidence}).
export const Captions = ({captions}: {captions: Caption[]}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const active = captions.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!active) return null;
  return (
    <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center',
      color: 'white', fontSize: 64, fontWeight: 700, fontFamily: 'sans-serif', textShadow: '0 4px 12px #000'}}>
      {active.text}
    </div>
  );
};
