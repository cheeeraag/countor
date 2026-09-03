const router = require('express').Router()
const pool = require('../db')
const { requireUser } = require('../middleware/roles')

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const VOICE_MAX_BYTES = 15 * 1024 * 1024
const GEMINI_MAX_ATTEMPTS = 3
const GEMINI_RETRY_DELAYS_MS = [1000, 2500]
const GEMINI_REQUEST_TIMEOUT_MS = 60000

const TRIAGE_SYSTEM_PROMPT = `You are Countor's structured mental-wellness triage scorer.

The user has provided a free-form account of their day or current thoughts. Estimate two screening dimensions from the linguistic evidence in the transcript:

1) y_score_raw = positive mental wellbeing, mapped to the MHC-SF 14-item scoring range 0-70.
2) x_score_raw = psychological distress, mapped to the PHQ-ADS 16-item scoring range 0-48.

Important methodological constraints:
- This is an ESTIMATE from unstructured language, not an actual administration of MHC-SF or PHQ-ADS.
- Do not diagnose a disorder and do not claim that the transcript is equivalent to a validated questionnaire.
- Score only what the transcript supports. Do not infer symptoms from silence, writing style, personality, productivity, or demographic assumptions.
- Positive wellbeing evidence includes happiness, interest, life satisfaction, meaning, purpose, positive relationships, belonging, contribution, growth, competence, autonomy and optimism.
- Distress evidence includes low mood, anhedonia, hopelessness, excessive worry, nervousness, inability to relax, fatigue/low energy, sleep disturbance, appetite change, guilt/worthlessness, concentration difficulty, psychomotor changes and related functional burden.
- A bad day, procrastination, boredom, frustration, or low productivity alone should NOT be treated as clinical distress.
- A person can have high wellbeing and meaningful distress at the same time; score both dimensions independently.
- Do not invent questionnaire answers. Use the transcript as evidence and choose conservative scores when evidence is weak.
- The raw ranges are inclusive: y_score_raw 0-70 and x_score_raw 0-48.

Return ONLY valid JSON with exactly these keys:
{"y_score_raw": number, "x_score_raw": number}
No markdown, explanation, labels, or extra keys.`

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number(n)))
}

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  return key?.trim()
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function geminiErrorCode(err) {
  return err?.cause?.code || err?.code || err?.name || 'unknown'
}

async function callGemini({ model = getGeminiModel(), contents, generationConfig, operation = 'request' }) {
  const key = getGeminiKey()
  if (!key) throw new Error('GEMINI_API_KEY is not configured')

  const requestBody = JSON.stringify({ contents, generationConfig })
  let lastError

  console.log(`[Gemini] ${operation} start model=${model} requestBytes=${Buffer.byteLength(requestBody)} keyConfigured=${Boolean(key)}`)

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    const startedAt = Date.now()
    try {
      console.log(`[Gemini] ${operation} attempt=${attempt}/${GEMINI_MAX_ATTEMPTS}`)

      const response = await fetch(
        `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: requestBody,
          signal: AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS),
        }
      )

      const elapsedMs = Date.now() - startedAt
      const payload = await response.json().catch(() => ({}))
      console.log(`[Gemini] ${operation} response status=${response.status} elapsedMs=${elapsedMs}`)

      if (!response.ok) {
        console.error(`[Gemini] ${operation} API error:`, JSON.stringify(payload))
        const apiMessage = payload?.error?.message
        throw new Error(apiMessage ? `Gemini request failed: ${apiMessage}` : 'Gemini request failed')
      }

      const text = payload?.candidates?.[0]?.content?.parts
        ?.filter(part => typeof part.text === 'string')
        .map(part => part.text)
        .join('')
        .trim()

      if (!text) throw new Error('Gemini returned no text')

      console.log(`[Gemini] ${operation} success elapsedMs=${Date.now() - startedAt} outputChars=${text.length}`)
      return text
    } catch (err) {
      lastError = err
      const elapsedMs = Date.now() - startedAt
      const code = geminiErrorCode(err)
      const retryable = err?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        err?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        err?.name === 'AbortError' ||
        err?.name === 'TimeoutError' ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ECONNREFUSED' ||
        err?.code === 'EAI_AGAIN'

      console.error(`[Gemini] ${operation} failed attempt=${attempt}/${GEMINI_MAX_ATTEMPTS} elapsedMs=${elapsedMs} code=${code} message=${err.message}`)

      if (!retryable || attempt === GEMINI_MAX_ATTEMPTS) break

      console.warn(`[Gemini] ${operation} retrying after ${GEMINI_RETRY_DELAYS_MS[attempt - 1] || 2500}ms`)
      await sleep(GEMINI_RETRY_DELAYS_MS[attempt - 1] || 2500)
    }
  }

  if (lastError?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || lastError?.code === 'UND_ERR_CONNECT_TIMEOUT') {
    throw new Error('Could not connect to Gemini from the backend. Railway network connection to Google timed out after multiple attempts.')
  }

  if (lastError?.name === 'TimeoutError' || lastError?.name === 'AbortError') {
    throw new Error(`Gemini ${operation} timed out after ${GEMINI_REQUEST_TIMEOUT_MS / 1000} seconds. Please try again.`)
  }

  throw lastError || new Error('Gemini request failed')
}

async function transcribeVoice(audioBase64, mimeType) {
  const buffer = Buffer.from(audioBase64, 'base64')
  if (!buffer.length) throw new Error('Empty audio')
  if (buffer.length > VOICE_MAX_BYTES) throw new Error('Audio file is too large')

  // Gemini expects an IANA MIME type; browser MediaRecorder may append codec parameters.
  const normalizedMimeType = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase()

  console.log(`[Gemini] Transcription input audioBytes=${buffer.length} mimeType=${normalizedMimeType}`)
  const startedAt = Date.now()
  const result = await callGemini({
    operation: 'transcription',
    contents: [{
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: normalizedMimeType,
            data: audioBase64,
          },
        },
        {
          text: 'Transcribe this audio exactly as spoken. Return only the transcript text. Do not summarize, interpret, diagnose, or add commentary.',
        },
      ],
    }],
  })
  console.log(`[Gemini] Transcription completed elapsedMs=${Date.now() - startedAt} transcriptChars=${result.length}`)
  return result
}

async function scoreTranscript(transcript) {
  console.log(`[Gemini] Scoring input transcriptChars=${transcript.length}`)
  const startedAt = Date.now()
  const text = await callGemini({
    operation: 'scoring',
    contents: [{
      role: 'user',
      parts: [{ text: `${TRIAGE_SYSTEM_PROMPT}\n\nTranscript:\n${transcript}` }],
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          y_score_raw: {
            type: 'NUMBER',
            description: 'Estimated positive mental wellbeing score on the MHC-SF raw range 0-70.',
          },
          x_score_raw: {
            type: 'NUMBER',
            description: 'Estimated psychological distress score on the PHQ-ADS raw range 0-48.',
          },
        },
        required: ['y_score_raw', 'x_score_raw'],
      },
    },
  })
  console.log(`[Gemini] Scoring completed elapsedMs=${Date.now() - startedAt}`)

  let parsed
  try {
    parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim())
  } catch {
    throw new Error('Gemini scoring returned invalid JSON')
  }

  const y = Number(parsed.y_score_raw)
  const x = Number(parsed.x_score_raw)
  if (!Number.isFinite(y) || !Number.isFinite(x)) {
    throw new Error('Gemini scoring returned invalid scores')
  }

  return {
    y_score_raw: Math.round(clamp(y, 0, 70)),
    x_score_raw: Math.round(clamp(x, 0, 48)),
  }
}

function scoreQuestionnaire(answers) {
  let y_score_raw = 0
  for (let i = 1; i <= 14; i++) y_score_raw += Number(answers?.[`q${i}`] || 0)

  let x_score_raw = 0
  for (let i = 15; i <= 30; i++) x_score_raw += Number(answers?.[`q${i}`] || 0)

  return {
    y_score_raw: clamp(y_score_raw, 0, 70),
    x_score_raw: clamp(x_score_raw, 0, 48),
  }
}

async function saveAndRecommend({ userId, mode, y_score_raw, x_score_raw, safetyFlag = false }) {
  const today = new Date().toISOString().split('T')[0]
  const y_score_norm = parseFloat(((y_score_raw / 70) * 100).toFixed(2))
  const x_score_norm = parseFloat(((x_score_raw / 48) * 100).toFixed(2))
  const storedAnswers = JSON.stringify({ mode })

  const { rows: checkinRows } = await pool.query(
    `INSERT INTO checkins (user_id, date, y_score_raw, x_score_raw, y_score_norm, x_score_norm, suicidality_flag, answers)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id, date)
     DO UPDATE SET y_score_raw=$3, x_score_raw=$4, y_score_norm=$5, x_score_norm=$6, suicidality_flag=$7, answers=$8, created_at=NOW()
     RETURNING *`,
    [userId, today, y_score_raw, x_score_raw, y_score_norm, x_score_norm, safetyFlag, storedAnswers]
  )

  const { rows: platforms } = await pool.query(`SELECT * FROM platforms`)
  platforms.forEach(p => {
    p.distance = Math.sqrt(
      Math.pow(x_score_norm - p.anchor_x, 2) +
      Math.pow(y_score_norm - p.anchor_y, 2)
    )
  })
  platforms.sort((a, b) => a.distance - b.distance)

  return { checkin: checkinRows[0], recommendations: platforms.slice(0, 3) }
}

router.post('/', requireUser, async (req, res) => {
  const { mode = 'questionnaire', answers, audioBase64, mimeType } = req.body || {}

  try {
    if (mode === 'voice') {
      if (!audioBase64) return res.status(400).json({ error: 'Voice recording is required' })

      const transcript = await transcribeVoice(audioBase64, mimeType)
      if (!transcript) return res.status(400).json({ error: 'Could not detect speech in the recording' })

      const { y_score_raw, x_score_raw } = await scoreTranscript(transcript)
      const safetyFlag = /\b(kill myself|killing myself|suicide|suicidal|self[- ]?harm|hurt myself|harm myself|better off dead|want to die|wish i were dead)\b/i.test(transcript)

      return res.json(await saveAndRecommend({
        userId: req.user.id,
        mode: 'voice',
        y_score_raw,
        x_score_raw,
        safetyFlag,
      }))
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Questionnaire answers are required' })
    }

    const { y_score_raw, x_score_raw } = scoreQuestionnaire(answers)
    const safetyFlag = Number(answers.q23 || 0) > 0

    return res.json(await saveAndRecommend({
      userId: req.user.id,
      mode: 'questionnaire',
      y_score_raw,
      x_score_raw,
      safetyFlag,
    }))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to save check-in' })
  }
})

router.get('/', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT date, y_score_raw, x_score_raw, y_score_norm, x_score_norm, suicidality_flag,
              EXTRACT(EPOCH FROM created_at)*1000 AS ts
       FROM checkins
       WHERE user_id = $1
       ORDER BY date ASC`,
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

module.exports = router
