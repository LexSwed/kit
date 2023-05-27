import { type EditorThemeClasses } from "lexical";

// for Tailwind editor suggestions by css`` pattern
const css = (classNames: string) => classNames;

export const theme: EditorThemeClasses = {
  heading: {
    h1: css("mt-[0.8em] mb-[0.4em] text-3xl"),
    h2: css("mt-[0.8em] mb-[0.4em] text-2xl"),
    h3: css("mt-[0.8em] mb-[0.4em] text-xl"),
    h4: css("mt-[0.8em] mb-[0.4em] text-xl"),
    h5: css("mt-[0.8em] mb-[0.4em] text-xl"),
    h6: css("mt-[0.8em] mb-[0.4em] text-lg uppercase"),
  },
  text: {
    bold: css("font-bold"),
    code: css(
      "rounded-xs -m-[2px] inline-block whitespace-pre-wrap bg-primary/10 align-middle font-mono text-[0.8em] leading-[1.5em] text-primary px-0.5"
    ),
    italic: css("italic"),
    strikethrough: css("line-through"),
    subscript: css("align-sub"),
    superscript: css("align-super"),
    underline: css("underline"),
    underlineStrikethrough: css("[text-decoration:underline_line-through]"),
  },
  paragraph: css("relative m-0"),
  quote: css(
    "mb-3 p-4 bg-surface text-on-surface border-2 rounded-sm border-outline"
  ),
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
