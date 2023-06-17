import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin.js';

import fxtrotTheme from './default-theme.ts';
import { createTailwindVariables } from './utils.ts';

/**
 * Overrides default -top, -bottom, etc with CSS Logical Properties
 *  */
const logicalPropertiesPlugin = plugin(({ matchUtilities, theme }) => {
  matchUtilities(
    {
      p: (value) => ({
        padding: value,
      }),
      pt: (value) => ({
        paddingBlockStart: value,
      }),
      pb: (value) => ({
        paddingBlockEnd: value,
      }),
      pl: (value) => ({
        paddingInlineStart: value,
      }),
      pr: (value) => ({
        paddingInlineEnd: value,
      }),
      py: (value) => ({
        paddingBlock: value,
      }),
      px: (value) => ({
        paddingInline: value,
      }),
    },
    { values: theme('padding') }
  );
  matchUtilities(
    {
      m: (value) => ({
        margin: value,
      }),
      mt: (value) => ({
        marginBlockStart: value,
      }),
      mb: (value) => ({
        marginBlockEnd: value,
      }),
      ml: (value) => ({
        marginInlineStart: value,
      }),
      mr: (value) => ({
        marginInlineEnd: value,
      }),
      my: (value) => ({
        marginBlock: value,
      }),
      mx: (value) => ({
        marginInline: value,
      }),
    },
    { values: theme('margin') }
  );
  matchUtilities(
    {
      'size-y': (value) => ({
        blockSize: value,
      }),
    },
    { values: theme('height') }
  );
  matchUtilities(
    {
      'size-x': (value) => ({
        inlineSize: value,
      }),
    },
    { values: theme('width') }
  );
  matchUtilities(
    {
      size: (value) => ({
        blockSize: value,
        inlineSize: value,
      }),
    },
    { values: theme('height') }
  );
});
const fxtrotPlugin = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      ...createTailwindVariables(fxtrotTheme),
      opacity: {
        15: '0.15',
      },
    },
  },
  corePlugins: {
    padding: false,
    margin: false,
  },
  plugins: [logicalPropertiesPlugin],
} satisfies Config;

export default fxtrotPlugin;
