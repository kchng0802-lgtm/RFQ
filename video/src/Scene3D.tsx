import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

// All animation is driven by the frame number (never useFrame/clock) so renders are deterministic.
export const Scene3D = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;
  const scale = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <ThreeCanvas width={width} height={height} camera={{position: [0, 0, 6], fov: 50}}>
      <color attach="background" args={['#0b1020']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <mesh rotation={[t * Math.PI * 2, t * Math.PI * 4, 0]} scale={scale}>
        <torusKnotGeometry args={[1.2, 0.4, 200, 32]} />
        <meshStandardMaterial color="#4f8cff" metalness={0.6} roughness={0.25} />
      </mesh>
    </ThreeCanvas>
  );
};
