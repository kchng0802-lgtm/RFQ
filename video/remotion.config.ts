import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Software WebGL so Three.js renders on machines without a GPU
Config.setChromiumOpenGlRenderer('swangle');
