import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./styles/GlobalStyles.js"
import GlobalStyle from './styles/GlobalStyles.js'
import { HashRouter } from "react-router-dom";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <GlobalStyle />
      <App />
    </HashRouter>
  </StrictMode>,

)
