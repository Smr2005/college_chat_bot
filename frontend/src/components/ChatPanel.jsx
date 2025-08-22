import React, { useEffect, useRef, useState } from 'react'
import ChatCard3D from './ChatCard3D'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function ChatPanel() {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ace:messages') || '[]') } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [voices, setVoices] = useState([])
  const recognitionRef = useRef(null)
  const endRef = useRef(null)

  // Load available voices for TTS
  useEffect(() => {
    const synth = window.speechSynthesis
    const load = () => setVoices(synth.getVoices())
    load()
    synth.onvoiceschanged = load
  }, [])

  const pickVoice = () => {
    // Try to pick an English India or female voice if available
    const byLocale = voices.find(v => /en-IN/i.test(v.lang)) || voices.find(v => /en/i.test(v.lang))
    return byLocale || voices[0] || null
  }

  const speak = (text) => {
    if (!ttsEnabled) return
    if (!('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) u.voice = v
    u.rate = 1
    u.pitch = 1
    synth.speak(u)
  }

  // Persist and autoscroll
  useEffect(() => {
    try { localStorage.setItem('ace:messages', JSON.stringify(messages)) } catch {}
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const copyText = async (txt) => {
    try { await navigator.clipboard.writeText(txt) } catch {}
  }

  const sendMessage = async (text) => {
    const question = text.trim()
    if (!question) return
    setError('')
    setLoading(true)
    setMessages((m) => [...m, { role: 'user', text: question, ts: Date.now() }])

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Request failed: ${res.status}`)
      }
      const data = await res.json()
      const reply = data.reply || ''
      setMessages((m) => [...m, { role: 'assistant', text: reply, ts: Date.now() }])
      speak(reply)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const send = () => sendMessage(input)

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
      setInput('')
    }
  }

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Speech Recognition not supported in this browser.')
      return
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }
    const recog = new SR()
    recognitionRef.current = recog
    recog.lang = 'en-IN'
    recog.interimResults = false
    recog.continuous = false

    recog.onresult = (ev) => {
      const transcript = Array.from(ev.results).map(r => r[0].transcript).join(' ')
      setInput('')
      sendMessage(transcript)
    }
    recog.onerror = () => {
      setListening(false)
    }
    recog.onend = () => {
      setListening(false)
    }

    setListening(true)
    try { recog.start() } catch { setListening(false) }
  }

  const stopListening = () => {
    setListening(false)
    try { recognitionRef.current && recognitionRef.current.stop() } catch {}
  }

  const toggleMic = () => {
    if (listening) stopListening()
    else startListening()
  }

  return (
    <div className="chat-panel">
      {/* Animated gradient glow bar */}
      <div className="chat-glow" />

      {/* Embedded lightweight 3D layer for the card */}
      <div className="chat-3d-holder">
        <ChatCard3D />
        <div className="chat-3d-gradient" />
      </div>

      <div className="chat-box">
        {messages.length === 0 && (
          <div className="empty">Ask about admissions, departments, fees, facilities, and more.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            <div className="row">
              <div className="avatar" aria-hidden>{m.role === 'user' ? '🧑' : '🤖'}</div>
              <div className="msg">
                <div className="meta">
                  <span className="who">{m.role === 'user' ? 'You' : 'ACE Orbit'}</span>
                  {m.ts && <span className="ts">{new Date(m.ts).toLocaleTimeString()}</span>}
                  <button className="mini copy" onClick={() => copyText(m.text)} title="Copy message">Copy</button>
                </div>
                <div className="text">{m.text}</div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="typing">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
        {error && <div className="error">{error}</div>}
        <div ref={endRef} />
      </div>

      <div className="controls">
        <label className="switch">
          <input type="checkbox" checked={ttsEnabled} onChange={e => setTtsEnabled(e.target.checked)} />
          <span className="slider" />
          <span className="switch-label">Voice output</span>
        </label>

        <button className={`btn mic ${listening ? 'active' : ''}`} onClick={toggleMic} title="Voice input">
          {listening ? 'Listening…' : '🎤 Speak'}
        </button>
      </div>

      <div className="input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your question…"
          rows={2}
        />
        <button className="btn send" onClick={() => { send(); setInput('') }} disabled={loading}>Send</button>
      </div>
    </div>
  )
}