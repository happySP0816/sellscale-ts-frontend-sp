import PageFrame from "./PageFrame";
import { render } from "react-dom";
import { createRoot, Root } from 'react-dom/client';

let root: Root;
beforeEach(() => {
  const div = document.createElement('div'); 
  root = createRoot(div!);
});

it('renders without crashing', () => {
  root.render(<PageFrame children={undefined} />);
});
