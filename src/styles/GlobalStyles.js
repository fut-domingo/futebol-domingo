  import { createGlobalStyle } from "styled-components";

  export const GlobalStyle = createGlobalStyle`
    :root {
  /* volta a estética “forte” */
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* cores padrão do teu site */
  --ink: #2a004f;
  --muted: rgba(42,0,79,0.65);
  --border: rgba(224,216,255,0.9);
  --bg: #f6f7fb;
}

* { box-sizing: border-box; }

html, body {
  height: 100%;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-weight: 600;            /* ✅ volta o “bold” geral */
}

button, input, select, textarea {
  font: inherit;
  color: inherit;
}

/* Títulos com cara de “Premier / Dashboard” */
h1, h2, h3, h4, h5 {
  margin: 0;
  font-weight: 1000;
  letter-spacing: -0.02em;
  color: var(--ink);
}

/* Links e foco */
a { color: inherit; }
:focus-visible {
  outline: 3px solid rgba(91,44,255,0.25);
  outline-offset: 2px;
  border-radius: 8px;
}

/* Inputs mais bonitos (se tiver inputs simples no Admin/Edit) */
input[type="number"], input[type="text"], input[type="date"] {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.9);
}

.userEmail{
  font-weight: 900;
  color: rgba(42,0,79,0.65);
}

@media (max-width: 520px){
  .userEmail{
    display: none;
  }
}

  `;
  export default GlobalStyle;