# 3D Video Studio (Three.js + Remotion)

- `npm run dev`    – open Remotion Studio (live preview)
- `npm run build`  – render `out/video.mp4`
- `npm run still`  – render one frame to `out/still.png`

Files: `src/Scene3D.tsx` (Three.js scene via @react-three/fiber + @remotion/three),
`src/Captions.tsx` (captions), `src/Main.tsx` (compose scene + audio + captions), `src/Root.tsx` (size/fps/duration).
Audio: put files in `public/` and use `<Audio src={staticFile('x.mp3')} />`.
Auto-captions: `@remotion/install-whisper-cpp` is installed (needs internet to download the model).

Rules: drive all animation from `useCurrentFrame()`, not `useFrame`/clock.
No GPU? `remotion.config.ts` uses the `swangle` software renderer.
