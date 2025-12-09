import React from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import App from './App'
import './styles.css'

// Limit devicePixelRatio and set conservative GL options to improve
// rendering performance on lower-end machines and during demos.
const DPR = (typeof window !== 'undefined' && window.devicePixelRatio)
  ? Math.min(window.devicePixelRatio, 1.5)
  : 1

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      pixelRatio={DPR}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.6} />
      <App />
    </Canvas>
  </React.StrictMode>
)
