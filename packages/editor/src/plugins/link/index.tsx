import { useCallback } from "react";
import { LinkNode } from "@lexical/link";
import { AutoLinkPlugin as LexicalAutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin.js";
import { LinkPlugin as LexicalLinkPlugin } from "@lexical/react/LexicalLinkPlugin.js";
import { NodeEventPlugin as LexicalNodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin.js";

import { MATCHERS, validateUrl } from "./utils.ts";

export const LinkPlugin = () => {
  const onClick = useCallback((...args) => {
    console.log(...args);
  }, []);

  return (
    <>
      <LexicalLinkPlugin validateUrl={validateUrl} />
      <LexicalAutoLinkPlugin matchers={MATCHERS} />
      <LexicalNodeEventPlugin
        nodeType={LinkNode}
        eventType="click"
        eventListener={onClick}
      />
    </>
  );
};
