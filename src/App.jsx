import React, { Suspense } from 'react'
import { OrbitControls } from '@react-three/drei'
import Orb from './Orb'

export default function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Orb />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  )
}
