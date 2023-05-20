import type { ComponentProps } from 'react';
import * as RdxDialog from '@radix-ui/react-dialog';

import { Heading } from '../heading/index.ts';

type Props = ComponentProps<typeof Heading>;

export const DialogTitle = ({ level = '4', ...props }: Props) => {
  return (
    <RdxDialog.Title asChild>
      <Heading {...props} level={level} />
    </RdxDialog.Title>
  );
};
