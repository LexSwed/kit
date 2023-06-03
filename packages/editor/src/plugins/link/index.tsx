import { AutoLinkPlugin as LexicalAutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin.js";
import { LinkPlugin as LexicalLinkPlugin } from "@lexical/react/LexicalLinkPlugin.js";

import { MATCHERS, validateUrl } from "./utils.ts";

export const LinkPlugin = () => {
  return (
    <>
      <LexicalLinkPlugin validateUrl={validateUrl} />
      <LexicalAutoLinkPlugin matchers={MATCHERS} />
    </>
  );
};
