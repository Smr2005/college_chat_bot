import React, { useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles, Float, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

function ParallaxGroup({ children, factor = 0.03, ...props }) {
  const ref = React.useRef()
  const { mouse, viewport } = useThree()
  useFrame(() => {
    const x = (mouse.x || 0) * viewport.width * factor
    const y = (mouse.y || 0) * viewport.height * factor
    if (ref.current) ref.current.position.set(x, y, 0)
  })
  return <group ref={ref} {...props}>{children}</group>
}

function BGScene({ mobile }) {
  const starCount = mobile ? 2500 : 6000
  const sparklesA = mobile ? 70 : 140
  const sparklesB = mobile ? 45 : 90

  return (
    <>
      <ambientLight intensity={0.25} />
      <Environment preset="city" />

      {/* Deep star field */}
      <Stars radius={200} depth={100} count={starCount} factor={3} saturation={0} fade speed={0.4} />

      {/* Parallax sparkles clouds */}
      <ParallaxGroup factor={0.02}>
        <Sparkles count={sparklesA} scale={[30, 15, 10]} size={2.2} speed={0.55} noise={0.8} color="#7cc4ff" />
      </ParallaxGroup>
      <ParallaxGroup factor={-0.015}>
        <Sparkles count={sparklesB} scale={[25, 12, 8]} size={2.0} speed={0.75} noise={1.0} color="#9b6dff" />
      </ParallaxGroup>

      {/* Large subtle floating shapes around edges */}
      <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.3}>
        <mesh position={[6, -2, -6]}>
          <icosahedronGeometry args={[2.2, 1]} />
          <meshStandardMaterial color="#1b2a58" metalness={0.6} roughness={0.6} />
        </mesh>
      </Float>
      <Float speed={0.5} rotationIntensity={0.12} floatIntensity={0.25}>
        <mesh position={[-7, 3, -8]}>
          <torusGeometry args={[2.6, 0.08, 16, 200]} />
          <meshStandardMaterial color="#182247" metalness={0.7} roughness={0.5} />
        </mesh>
      </Float>

      {/* Postprocessing for glow and mood */}
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom intensity={0.65} luminanceThreshold={0.18} luminanceSmoothing={0.22} mipmapBlur />
        <ChromaticAberration offset={[0.0007, 0.0005]} blendFunction={BlendFunction.NORMAL} />
        <Noise opacity={0.02} premultiply />
        <Vignette eskil={false} offset={0.25} darkness={0.55} />
      </EffectComposer>
    </>
  )
}

export default function Background3D({ theme = 'dark' }) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768
  const dpr = useMemo(() => (mobile ? [1, 1.25] : [1, 2]), [mobile])
  // Adjust background color based on theme
  const bg = theme === 'light' ? '#f6f8ff' : '#070a14'
  return (
    <div className="bg-canvas" aria-hidden="true">
      <Canvas dpr={dpr} camera={{ position: [0, 0, 12], fov: 55 }}>
        <color attach="background" args={[bg]} />
        <BGScene mobile={mobile} />
      </Canvas>
    </div>
  )
}