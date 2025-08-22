import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sparkles, Float } from '@react-three/drei'

function CardScene({ mobile }) {
  const sparkCount = mobile ? 35 : 75
  const ringRadius = mobile ? 2.4 : 3.2

  return (
    <>
      <ambientLight intensity={0.35} />

      {/* Soft sparkles behind messages */}
      <Sparkles count={sparkCount} scale={[8, 4, 4]} size={2.2} speed={0.6} noise={0.9} color="#7cc4ff" />

      {/* Subtle floating ring */}
      <Float speed={0.8} rotationIntensity={0.25} floatIntensity={0.4}>
        <mesh position={[0, -0.5, -1.5]}>
          <torusGeometry args={[ringRadius, 0.05, 16, 200]} />
          <meshStandardMaterial color="#7cc4ff" metalness={0.8} roughness={0.25} emissive="#2a3f6f" emissiveIntensity={0.12} />
        </mesh>
      </Float>

      {/* Soft top glow arc */}
      <Float speed={0.7} rotationIntensity={0.15} floatIntensity={0.3}>
        <mesh position={[0, 1.2, -1.2]} rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[mobile ? 1.3 : 1.6, 0.03, 16, 160]} />
          <meshStandardMaterial color="#9b6dff" metalness={0.7} roughness={0.3} emissive="#493a7c" emissiveIntensity={0.1} />
        </mesh>
      </Float>
    </>
  )
}

export default function ChatCard3D() {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768
  const dpr = useMemo(() => (mobile ? [1, 1.25] : [1, 2]), [mobile])
  return (
    <div className="chat-3d" aria-hidden="true">
      <Canvas dpr={dpr} camera={{ position: [0, 0, 8], fov: 55 }}>
        <CardScene mobile={mobile} />
      </Canvas>
    </div>
  )
}