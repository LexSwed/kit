import { type Config } from 'tailwindcss';

import fxtrotPreset from '../ui/src/lib/tailwind/preset.ts';

export default {
  presets: [fxtrotPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../editor/src/**/*.{js,ts,jsx,tsx}',
    '../shared/src/**/*.{js,ts,jsx,tsx}',
    '../ui/src/lib/**/*.{js,ts,jsx,tsx}',
  ],
} satisfies Config;
