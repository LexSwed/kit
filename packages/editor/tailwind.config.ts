import { type Config } from "tailwindcss";

import fxtrotConfig from "../ui/tailwind.config.ts";

export default {
  ...fxtrotConfig,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "../editor/src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}",
    "../ui/src/lib/**/*.{js,ts,jsx,tsx}",
  ],
} satisfies Config;
