import type { ComponentProps } from 'react';
import { useId } from '@radix-ui/react-id';

import { Flex } from '../flex/flex.tsx';
import { Text } from '../text/index.ts';

interface Props extends ComponentProps<typeof Flex> {
  title: string;
}

const Section = ({ title, children, cross = 'stretch', flow = 'column', gap = 'md', id: propId, ...props }: Props) => {
  const id = useId(propId);
  return (
    <Flex cross={cross} flow={flow} gap={gap} {...props}>
      <Text id={id} textStyle="overline" tone="light">
        {title}
      </Text>
      <div role="group" aria-labelledby={id}>
        {children}
      </div>
    </Flex>
  );
};

export { Section };
