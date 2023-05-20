import { type Config } from 'tailwindcss';

import fxtrotPreset from '@fxtrot/ui/tailwind.preset';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    '../editor/src/**/*.{js,ts,jsx,tsx}',
    '../shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [fxtrotPreset],
} satisfies Config;
