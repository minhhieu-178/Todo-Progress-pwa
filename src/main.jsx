import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import store from './app/store' // <-- 1. Import store
import { Provider } from 'react-redux' // <-- 2. Import Provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> {/* <-- 3. Bọc <App /> bằng <Provider> */}
      <App />
    </Provider>
  </StrictMode>,
)
