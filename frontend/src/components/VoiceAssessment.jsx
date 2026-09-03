import { useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 120
const TARGET_SECONDS = 60

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = String(reader.result || '')
      resolve(result.includes(',') ? result.split(',')[1] : result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function VoiceAssessment({ onComplete, onBack }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
  }

  const finishRecording = async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    clearInterval(timerRef.current)
    recorder.stop()
    setRecording(false)
    stopTracks()
  }

  const startRecording = async () => {
    setError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('Voice recording is not supported in this browser. Please use the questionnaire instead.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
      const mimeType = preferred.find(type => MediaRecorder.isTypeSupported(type)) || ''
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = event => {
        if (event.data?.size) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        clearInterval(timerRef.current)
        setRecording(false)
        stopTracks()
        setError('Recording failed. Please try again or use the questionnaire.')
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        chunksRef.current = []
        if (!blob.size) {
          setError('No audio was captured. Please try again.')
          return
        }
        if (seconds < 2) {
          setError('Please speak for at least a few seconds before stopping.')
          return
        }

        setProcessing(true)
        try {
          const audioBase64 = await blobToBase64(blob)
          await onComplete({
            mode: 'voice',
            audioBase64,
            mimeType: blob.type || 'audio/webm',
          })
        } catch (e) {
          setError(e.message || 'Could not process the voice assessment.')
        } finally {
          setProcessing(false)
        }
      }

      recorder.start(500)
      setSeconds(0)
      setRecording(true)
      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1
          if (next >= MAX_SECONDS) {
            setTimeout(() => finishRecording(), 0)
          }
          return next
        })
      }, 1000)
    } catch (e) {
      stopTracks()
      setError(e.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Allow microphone access or choose the questionnaire.'
        : (e.message || 'Could not access your microphone.'))
    }
  }

  const toggleRecording = () => {
    if (processing) return
    if (recording) finishRecording()
    else startRecording()
  }

  const progress = Math.min((seconds / TARGET_SECONDS) * 100, 100)
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <button className="btn-ghost" onClick={onBack} disabled={recording || processing} style={{ marginBottom: 24, fontSize: 14 }}>
          ← Back
        </button>

        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 46, marginBottom: 12 }}>{recording ? '🎙️' : processing ? '🧠' : '🎤'}</p>
          <h1 style={{ fontSize: 24, fontFamily: "'Lora', serif", marginBottom: 10 }}>
            {processing ? 'Analyzing your check-in...' : 'Voice Check-in'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 26 }}>
            {processing
              ? 'Your recording is being transcribed and mapped to the 2D wellbeing and distress framework.'
              : 'Take about 60 seconds. How was your day, and what is on your mind? Speak naturally — there are no questions to answer.'}
          </p>

          {!processing && (
            <>
              <div style={{ height: 8, background: 'var(--cream2)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--green)', transition: 'width .3s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 26 }}>
                <span>{recording ? `${minutes}:${secs}` : '60 sec recommended'}</span>
                <span>Maximum 02:00</span>
              </div>

              <button
                onClick={toggleRecording}
                className="btn-primary"
                style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px', justifyContent: 'center', fontSize: 30, padding: 0 }}
                aria-label={recording ? 'Stop recording' : 'Start recording'}
              >
                {recording ? '■' : '🎙'}
              </button>

              <p style={{ fontSize: 13, fontWeight: 700, color: recording ? 'var(--green)' : 'var(--text)', marginBottom: 12 }}>
                {recording ? 'Recording… tap to stop' : 'Tap to start speaking'}
              </p>
            </>
          )}

          {error && (
            <div style={{ background: '#FFF4F4', border: '1px solid #F2C7C7', color: '#9A2D2D', borderRadius: 10, padding: 12, fontSize: 12, lineHeight: 1.5, marginTop: 16 }}>
              {error}
            </div>
          )}

          {!recording && !processing && (
            <button className="btn-outline" onClick={onBack} style={{ marginTop: 18, width: '100%', padding: 12 }}>
              Use questionnaire instead
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
