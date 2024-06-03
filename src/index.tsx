import React from 'react';
import ReactDOM from 'react-dom/client';
import Pop from './Pop';

const root = document.createElement("div")
root.className = "container"
document.body.appendChild(root)
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <Pop />
  </React.StrictMode>
);
