import { type Config } from 'tailwindcss';
// @ts-expect-error can't resolve
import fxtrotPreset from '@fxtrot/ui/tailwind.preset';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [fxtrotPreset],
} satisfies Config;
