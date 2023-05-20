import Link from 'next/link.js';
import { useRouter } from 'next/router.js';

import { Column, MenuList, Section } from '@fxtrot/ui';

type DocEntry = { section: string; title?: string; href: string };

type Props = {
  docs: DocEntry[];
};

export const SideNav = ({ docs }: Props) => {
  const groupped = docs.reduce<{ [section: string]: DocEntry[] }>(
    (res, item) => {
      res[item.section].push(item);
      return res;
    },
    {
      '': [],
      'Components': [],
      'Patterns': [],
    }
  );
  return (
    <Column className="gap-12" as="nav">
      <MenuList>
        {Object.entries(groupped).map(([section, links]) => {
          if (!section) {
            return <LinksList links={links} key="index routes" />;
          }
          return (
            <Section title={section} gap="sm" className="mt-4" key={section}>
              <LinksList links={links} />
            </Section>
          );
        })}
      </MenuList>
    </Column>
  );
};

const LinksList = ({ links }: { links: DocEntry[] }) => {
  const router = useRouter();
  return (
    <>
      {links.map((item) => {
        return (
          // @ts-expect-error https://github.com/vercel/next.js/issues/46078
          <Link href={item.href} passHref legacyBehavior key={item.title}>
            <MenuList.Item active={item.href === router.pathname}>{item.title}</MenuList.Item>
          </Link>
        );
      })}
    </>
  );
};
