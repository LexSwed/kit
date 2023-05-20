import fxtrotPreset from './src/lib/tailwind/preset.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,md,mdx}'],
  presets: [fxtrotPreset],
};
