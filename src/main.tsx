import React from 'react'
import { createRoot } from 'react-dom/client'
// import { App } from '~/App_old'
import '~/App.css'
import 'uno.css'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <h1>Test</h1>
  </React.StrictMode>,
)
