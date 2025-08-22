import React, { useRef, useState, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Text, Environment, Stars, Sparkles, MeshReflectorMaterial } from '@react-three/drei'
import { motion } from 'framer-motion'
import './styles.css'
import ChatPanel from './components/ChatPanel'
import Background3D from './components/Background3D'
import Navbar from './components/Navbar'

function HelpModal({ open, onClose }) {
  if (!open) return null
  return (
    <div id="help-modal" className="modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card">
        <div className="modal-head">
          <h2 id="help-title">How to use ACE Orbit</h2>
          <button className="btn ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <ul>
            <li>Ask questions about admissions, fees, departments, facilities, etc.</li>
            <li>Use the mic button for voice input; toggle Voice output for TTS.</li>
            <li>Copy any message with the Copy button in its header.</li>
            <li>Your chat is saved locally on this device.</li>
          </ul>
        </div>
        <div className="modal-foot">
          <button className="btn send" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  )
}

function Spinning({ speed = 0.6, children }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * speed
      ref.current.rotation.x += dt * (speed * 0.25)
    }
  })
  return <group ref={ref}>{children}</group>
}

function Scene() {
  return (
    <>
      {/* Background and lighting */}
      <color attach="background" args={["#0a0f1f"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 5]} intensity={0.9} />
      <Environment preset="city" />

      {/* Stars and sparkles for depth */}
      <Stars radius={120} depth={60} count={3000} factor={4} saturation={0} fade speed={0.6} />
      <Sparkles count={90} scale={[10, 5, 8]} size={3} speed={0.7} noise={0.8} color="#7cc4ff" />

      {/* Reflective floor for premium feel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={12}
          roughness={0.85}
          depthScale={0.8}
          minDepthThreshold={0.4}
          color="#0b1020"
          metalness={0.6}
        />
      </mesh>

      {/* Floating 3D Title with subtle glow */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.7}>
        <Text fontSize={0.85} anchorX="center" anchorY="middle">
          ACE Orbit
          <meshStandardMaterial color="#7cc4ff" emissive="#7cc4ff" emissiveIntensity={0.2} />
        </Text>
      </Float>

      {/* Decorative spinning shapes */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <Spinning speed={0.7}>
          <mesh position={[2, -0.3, 0]} castShadow>
            <torusKnotGeometry args={[0.5, 0.12, 180, 24]} />
            <meshStandardMaterial color="#9b6dff" metalness={0.7} roughness={0.25} emissive="#9b6dff" emissiveIntensity={0.15} />
          </mesh>
        </Spinning>
      </Float>

      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.5}>
        <Spinning speed={0.35}>
          <mesh position={[-2.2, 0.25, -0.6]} castShadow>
            <icosahedronGeometry args={[0.7, 1]} />
            <meshStandardMaterial color="#6ef3c5" metalness={0.55} roughness={0.3} emissive="#6ef3c5" emissiveIntensity={0.1} />
          </mesh>
        </Spinning>
      </Float>

      {/* Halo ring */}
      <Float speed={1.25} rotationIntensity={0.25} floatIntensity={0.55}>
        <Spinning speed={0.5}>
          <mesh position={[0, -0.2, -1]}>
            <torusGeometry args={[1.8, 0.02, 16, 200]} />
            <meshStandardMaterial color="#7cc4ff" metalness={0.8} roughness={0.2} emissive="#7cc4ff" emissiveIntensity={0.05} />
          </mesh>
        </Spinning>
      </Float>

      <OrbitControls enablePan={false} minDistance={3} maxDistance={12} />
    </>
  )
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ace:theme') || 'dark')
  const [helpOpen, setHelpOpen] = useState(false)
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // Apply and persist theme on root element for CSS vars and 3D scenes
  React.useEffect(() => {
    try { localStorage.setItem('ace:theme', theme) } catch {}
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app">
      {/* Full-screen background 3D layer */}
      <Background3D theme={theme} />

      <Navbar onToggleTheme={toggleTheme} theme={theme} onHelp={() => setHelpOpen(true)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="header"
      >
        <h1>Aditya College of Engineering, Madanapalle</h1>
        <p className="subtitle">ACE Orbit — Your 24/7 ACEM assistant</p>
      </motion.div>

      <div className="content">
        <div className="canvas-wrapper">
          <Canvas shadows camera={{ position: [0, 1.4, 6], fov: 50 }}>
            <Scene />
          </Canvas>
        </div>
        <ChatPanel />
      </div>

      <footer>
        © {new Date().getFullYear()} ACEM — ACE Orbit
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)