import { frames as designSystemFrames } from './design-system.js';
import { frames as componentFrames } from './components.js';
import { frames as screenFrames, assets as screenAssets } from './screens.js';
import { frames as emailFrames } from './emails.js';

export const entries = [...designSystemFrames, ...componentFrames, ...screenFrames, ...emailFrames];
export const assets = screenAssets;
