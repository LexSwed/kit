/* @refresh reload */
import './style.css';
import { createElement, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { render } from 'solid-js/web';
import { ThemeProvider } from '@fxtrot/ui';
import { createContext } from 'solid-js';

import { Editor } from './editor';

const AppContext = createContext({ root: null as HTMLElement | null });

const App = (props: { root: HTMLElement }) => {
  return (
    <AppContext.Provider value={{ root: props.root }}>
      <div class="max-w-2xl mt-40 mx-auto">
        <Editor />
      </div>
    </AppContext.Provider>
  );
};

const ReactApp = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    render(() => <App root={el} />, el);
  }, []);
  return createElement(ThemeProvider, { children: createElement('div', { ref }) });
};

createRoot(document.getElementById('root') as HTMLDivElement).render(createElement(ReactApp));
