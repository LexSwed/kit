import { type EditorThemeClasses } from "lexical";

// for Tailwind editor suggestions by css`` pattern
const css = (classNames: string) => classNames;

export const theme: EditorThemeClasses = {
  heading: {
    h1: css(
      "[text-wrap:balance] [margin-trim:block] mt-[0.8em] mb-[0.6em] text-3xl"
    ),
    h2: css(
      "[text-wrap:balance] [margin-trim:block] mt-[0.8em] mb-[0.6em] text-2xl"
    ),
    h3: css(
      "[text-wrap:balance] [margin-trim:block] mt-[0.8em] mb-[0.6em] text-xl"
    ),
    h4: css(
      "[text-wrap:balance] [margin-trim:block] mt-[0.8em] mb-[0.6em] text-xl"
    ),
    h5: css(
      "[text-wrap:balance] [margin-trim:block] mt-[0.8em] mb-[0.6em] text-xl"
    ),
    h6: css(
      "[text-wrap:balance] [margin-trim:block] mt-[0.8em] mb-[0.6em] text-lg uppercase"
    ),
  },
  text: {
    bold: css("font-bold"),
    code: css(
      "rounded-xs -m-0.5 inline-block whitespace-pre-wrap bg-primary/10 align-middle font-mono text-[0.9em] text-primary px-0.5"
    ),
    italic: css("italic"),
    strikethrough: css("line-through"),
    subscript: css("align-sub"),
    superscript: css("align-super"),
    underline: css("underline"),
    underlineStrikethrough: css("[text-decoration:underline_line-through]"),
  },
  paragraph: css("relative m-0 mb-2"),
  quote: css("mt-2 mb-3 px-3 py-0 border-l-2 border-outline"),
  indent: css("pl-6"),
  link: css(
    "border-b-[1px] border-dotted pb-0.5 border-current cursor-pointer hover:border-solid"
  ),
  list: {
    listitem: css("ml-6"),
    nested: {
      listitem: css("list-none"),
    },
    olDepth: [
      css("list-inside"),
      css("[list-style-type:upper-alpha]"),
      css("[list-style-type:lower-alpha]"),
      css("[list-style-type:upper-roman]"),
      css("[list-style-type:lower-roman]"),
    ],
    ol: css("list-decimal"),
    ul: css("list-disc"),
  },
  collapsible: {
    container: css(
      "p-2 my-4 border-2 border-surface-variant/30 rounded-lg bg-surface-variant/5"
    ),
    title: css(
      "cursor-default flex flex-row gap-1 items-center p-2 -m-2 list-none"
    ),
    content: css(
      "p-2 mt-2 border-t-2 border-dashed border-surface-variant/30 -mx-2 [margin-trim:block]"
    ),
    expandButton: css(
      "-ml-1 -my-2 p-2 rounded-md hover:bg-surface-variant/40 focus:bg-surface-variant/40"
    ),
    expandButtonInnerHTML: `<svg class="${css(
      "size-4"
    )}" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 19.24-4.95-4.95-1.41 1.42L12 22.07l6.36-6.36-1.41-1.42L12 19.24zM5.64 8.29l1.41 1.42L12 4.76l4.95 4.95 1.41-1.42L12 1.93 5.64 8.29z"></path></svg>`,
  },
  // image: 'editor-image',
  // mark: 'PlaygroundEditorTheme__mark',
  // markOverlap: 'PlaygroundEditorTheme__markOverlap',
  // ltr: css('text-left'),
  // rtl: css('text-right'),
  // code: 'code',
  // codeHighlight: {
  //   atrule: 'PlaygroundEditorTheme__tokenAttr',
  //   attr: 'PlaygroundEditorTheme__tokenAttr',
  //   boolean: 'PlaygroundEditorTheme__tokenProperty',
  //   builtin: 'PlaygroundEditorTheme__tokenSelector',
  //   cdata: 'PlaygroundEditorTheme__tokenComment',
  //   char: 'PlaygroundEditorTheme__tokenSelector',
  //   class: 'PlaygroundEditorTheme__tokenFunction',
  //   'class-name': 'PlaygroundEditorTheme__tokenFunction',
  //   comment: 'PlaygroundEditorTheme__tokenComment',
  //   constant: 'PlaygroundEditorTheme__tokenProperty',
  //   deleted: 'PlaygroundEditorTheme__tokenProperty',
  //   doctype: 'PlaygroundEditorTheme__tokenComment',
  //   entity: 'PlaygroundEditorTheme__tokenOperator',
  //   function: 'PlaygroundEditorTheme__tokenFunction',
  //   important: 'PlaygroundEditorTheme__tokenVariable',
  //   inserted: 'PlaygroundEditorTheme__tokenSelector',
  //   keyword: 'PlaygroundEditorTheme__tokenAttr',
  //   namespace: 'PlaygroundEditorTheme__tokenVariable',
  //   number: 'PlaygroundEditorTheme__tokenProperty',
  //   operator: 'PlaygroundEditorTheme__tokenOperator',
  //   prolog: 'PlaygroundEditorTheme__tokenComment',
  //   property: 'PlaygroundEditorTheme__tokenProperty',
  //   punctuation: 'PlaygroundEditorTheme__tokenPunctuation',
  //   regex: 'PlaygroundEditorTheme__tokenVariable',
  //   selector: 'PlaygroundEditorTheme__tokenSelector',
  //   string: 'PlaygroundEditorTheme__tokenSelector',
  //   symbol: 'PlaygroundEditorTheme__tokenProperty',
  //   tag: 'PlaygroundEditorTheme__tokenProperty',
  //   url: 'PlaygroundEditorTheme__tokenOperator',
  //   variable: 'PlaygroundEditorTheme__tokenVariable',
  // },
};
