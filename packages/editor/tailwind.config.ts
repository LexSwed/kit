import { type Config } from 'tailwindcss';
// @ts-expect-error can't resolve
import fxtrotPreset from '@fxtrot/ui/tailwind.preset';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [fxtrotPreset],
} satisfies Config;
