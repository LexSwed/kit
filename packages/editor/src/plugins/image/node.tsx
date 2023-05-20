import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import { createEditor, DecoratorNode } from 'lexical';
import * as React from 'react';
import { Suspense } from 'react';

const ImageComponent = React.lazy(() => import('./component'));

export interface ImagePayload {
  altText: string;
  caption?: LexicalEditor;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  showCaption?: boolean;
  src: string;
  width?: number;
  captionsEnabled?: boolean;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src } = domNode;
    const node = $createImageNode({ altText, src });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    caption: SerializedEditor;
    height?: number;
    maxWidth: number;
    showCaption: boolean;
    src: string;
    width?: number;
    type: 'image';
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  #src: string;
  #altText: string;
  #width: 'inherit' | number;
  #height: 'inherit' | number;
  #maxWidth: number;
  #showCaption: boolean;
  #caption: LexicalEditor;
  // Captions cannot yet be used within editor cells
  #captionsEnabled: boolean;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.#src,
      node.#altText,
      node.#maxWidth,
      node.#width,
      node.#height,
      node.#showCaption,
      node.#caption,
      node.#captionsEnabled,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, caption, src, showCaption } = serializedNode;
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
    });
    const nestedEditor = node.#caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.#src);
    element.setAttribute('alt', this.#altText);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    showCaption?: boolean,
    caption?: LexicalEditor,
    captionsEnabled?: boolean,
    key?: NodeKey
  ) {
    super(key);
    this.#src = src;
    this.#altText = altText;
    this.#maxWidth = maxWidth;
    this.#width = width || 'inherit';
    this.#height = height || 'inherit';
    this.#showCaption = showCaption || false;
    this.#caption = caption || createEditor();
    this.#captionsEnabled = captionsEnabled || captionsEnabled === undefined;
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      caption: this.#caption.toJSON(),
      height: this.#height === 'inherit' ? 0 : this.#height,
      maxWidth: this.#maxWidth,
      showCaption: this.#showCaption,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.#width === 'inherit' ? 0 : this.#width,
    };
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable();
    writable.#width = width;
    writable.#height = height;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.#showCaption = showCaption;
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.#src;
  }

  getAltText(): string {
    return this.#altText;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.#src}
          altText={this.#altText}
          width={this.#width}
          height={this.#height}
          maxWidth={this.#maxWidth}
          nodeKey={this.getKey()}
          showCaption={this.#showCaption}
          caption={this.#caption}
          captionsEnabled={this.#captionsEnabled}
          resizable={true}
        />
      </Suspense>
    );
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(src, altText, maxWidth, width, height, showCaption, caption, captionsEnabled, key);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
