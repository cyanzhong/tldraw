import * as React from 'react'
import { Tldraw, TldrawApp } from '@tldraw/tldraw'
import './styles.css'

declare const window: Window & { app: TldrawApp }

export default function App(): JSX.Element {
  const rTldrawApp = React.useRef<TldrawApp>()
  const handleMount = React.useCallback((app: TldrawApp) => {
    rTldrawApp.current = app
    window.app = app
  }, [])

  return (
    <div className="tldraw">
      <Tldraw onMount={handleMount} />
    </div>
  )
}
