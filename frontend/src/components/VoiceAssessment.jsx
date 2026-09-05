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

  useEffect(() => () => {
    clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(track => track.stop())
  }, [])

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
  }

  const finishRecording = () => {
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
      recorder.ondataavailable = event => { if (event.data?.size) chunksRef.current.push(event.data) }
      recorder.onerror = () => {
        clearInterval(timerRef.current); setRecording(false); stopTracks()
        setError('Recording failed. Please try again or use the questionnaire.')
      }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        chunksRef.current = []
        if (!blob.size) { setError('No audio was captured. Please try again.'); return }
        setProcessing(true)
        try {
          const audioBase64 = await blobToBase64(blob)
          await onComplete({ mode: 'voice', audioBase64, mimeType: blob.type || 'audio/webm' })
        } catch (e) {
          setError(e.message || 'Could not process the voice assessment.')
        } finally { setProcessing(false) }
      }
      recorder.start(500)
      setSeconds(0)
      setRecording(true)
      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1
          if (next >= MAX_SECONDS) setTimeout(finishRecording, 0)
          return next
        })
      }, 1000)
    } catch (e) {
      stopTracks()
      setError(e.name === 'NotAllowedError' ? 'Microphone permission was denied. Allow microphone access or choose the questionnaire.' : (e.message || 'Could not access your microphone.'))
    }
  }

  const progress = Math.min((seconds / TARGET_SECONDS) * 100, 100)
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const listening = recording

  return (
    <div className="voice-page">
      <div className="voice-shell">
        <button className="btn-ghost voice-back" onClick={onBack} disabled={recording || processing}>← Back</button>
        <div className="card voice-card">
          <div className={`voice-orb ${listening ? 'is-listening' : ''} ${processing ? 'is-processing' : ''}`} aria-hidden="true">
            <span className="voice-orb-core" />
            <span className="voice-wave voice-wave-1" /><span className="voice-wave voice-wave-2" /><span className="voice-wave voice-wave-3" />
          </div>
          <p className="eyebrow">PRIVATE VOICE CHECK-IN</p>
          <h1>{processing ? 'Understanding your check-in...' : 'How have you been feeling lately?'}</h1>
          <p className="voice-copy">
            {processing
              ? 'Transcribing your response, assessing your wellness position, and finding relevant resources.'
              : "Tell us what's been on your mind. You can talk about your day, how you've been feeling, or anything that's been bothering you."}
          </p>

          {!processing && <>
            <div className="voice-language">You can speak in <strong>English or Hindi</strong>.</div>
            <div className="voice-progress"><div style={{ width: `${progress}%` }} /></div>
            <div className="voice-meta"><span>{recording ? `${minutes}:${secs}` : 'About 60 seconds'}</span><span>Maximum 02:00</span></div>
            <button className={`voice-orb-button ${recording ? 'recording' : ''}`} onClick={recording ? finishRecording : startRecording} aria-label={recording ? 'Stop recording' : 'Start recording'}>
              {recording ? <span className="voice-stop" /> : <span className="voice-mic-line"><i /><i /><i /></span>}
            </button>
            <p className={`voice-status ${recording ? 'active' : ''}`}>{recording ? 'Listening · tap to stop' : 'Tap to start'}</p>
            <p className="voice-privacy">Your recording is processed for this check-in and is not shown to organization administrators.</p>
          </>}
          {error && <div className="auth-alert error" style={{ marginTop: 18 }}><span>!</span><p>{error}</p></div>}
          {!recording && !processing && <button className="btn-outline" onClick={onBack} style={{ marginTop: 18, width:'100%' }}>Use questionnaire instead</button>}
        </div>
      </div>
    </div>
  )
}
