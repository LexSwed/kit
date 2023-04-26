/* @refresh reload */
import { render } from 'solid-js/web';
import { Editor } from './editor';

import './style.css';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?'
  );
}

const App = () => {
  return (
    <div class="max-w-2xl mt-40 mx-auto">
      <Editor />
    </div>
  );
};

render(() => <App />, root!);
