import React, { useState, useEffect, useRef, useCallback } from 'react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function useVoiceInterview() {
  const [isListening, setIsListening]     = useState(false)
  const [isSpeaking, setIsSpeaking]       = useState(false)
  const [transcript, setTranscript]       = useState('')
  const [interimTranscript, setInterim]   = useState('')
  const [volume, setVolume]               = useState(0)
  const [error, setError]                 = useState('')
  const [supported] = useState(() => Boolean(SpeechRecognition && window.speechSynthesis))

  const recognitionRef = useRef(null)
  const synthRef       = useRef(window.speechSynthesis)
  const analyserRef    = useRef(null)
  const animFrameRef   = useRef(null)
  const streamRef      = useRef(null)

  useEffect(() => {
    if (!supported) return
    const rec = new SpeechRecognition()
    rec.continuous      = true
    rec.interimResults  = true
    rec.lang            = 'en-US'

    rec.onresult = (e) => {
      let final = '', interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        e.results[i].isFinal ? (final += t) : (interim += t)
      }
      if (final) setTranscript(p => p + final)
      setInterim(interim)
    }
    rec.onerror = (e) => {
      if (e.error !== 'no-speech') setError(e.error)
    }
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    return () => { rec.abort(); synthRef.current?.cancel() }
  }, [supported])

  const startListening = useCallback(async () => {
    if (!supported || isListening) return
    setTranscript('')
    setInterim('')
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx   = new AudioContext()
      const src   = ctx.createMediaStreamSource(stream)
      const ana   = ctx.createAnalyser()
      ana.fftSize = 256
      src.connect(ana)
      analyserRef.current = ana
      const data = new Uint8Array(ana.frequencyBinCount)
      const tick = () => {
        ana.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setVolume(avg / 128)
        animFrameRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch { /* no mic, still proceed */ }
    recognitionRef.current?.start()
    setIsListening(true)
  }, [supported, isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterim('')
    cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    setVolume(0)
  }, [])

  const speak = useCallback((text, onEnd) => {
    if (!supported) return
    synthRef.current.cancel()
    const utt       = new SpeechSynthesisUtterance(text)
    utt.rate        = 0.95
    utt.pitch       = 1
    utt.onstart     = () => setIsSpeaking(true)
    utt.onend       = () => { setIsSpeaking(false); onEnd?.() }
    utt.onerror     = () => { setIsSpeaking(false); onEnd?.() }
    synthRef.current.speak(utt)
  }, [supported])

  const stopSpeaking  = useCallback(() => { synthRef.current?.cancel(); setIsSpeaking(false) }, [])
  const clearTranscript = useCallback(() => { setTranscript(''); setInterim('') }, [])

  return { isListening, isSpeaking, transcript, interimTranscript, volume, error, supported, startListening, stopListening, speak, stopSpeaking, clearTranscript }
}
