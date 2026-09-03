const router = require('express').Router()
const pool = require('../db')
const { requireUser } = require('../middleware/roles')

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const VOICE_MAX_BYTES = 15 * 1024 * 1024

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
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash'
}

async function callGemini({ model = getGeminiModel(), contents, generationConfig }) {
  const key = getGeminiKey()
  if (!key) throw new Error('GEMINI_API_KEY is not configured')

  const response = await fetch(
    `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
    }
  )

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('Gemini API error:', payload)
    throw new Error('Gemini request failed')
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.filter(part => typeof part.text === 'string')
    .map(part => part.text)
    .join('')
    .trim()

  if (!text) throw new Error('Gemini returned no text')
  return text
}

async function transcribeVoice(audioBase64, mimeType) {
  const buffer = Buffer.from(audioBase64, 'base64')
  if (!buffer.length) throw new Error('Empty audio')
  if (buffer.length > VOICE_MAX_BYTES) throw new Error('Audio file is too large')

  const transcript = await callGemini({
    contents: [{
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: audioBase64,
          },
        },
        {
          text: 'Transcribe this audio exactly as spoken. Return only the transcript text. Do not summarize, interpret, diagnose, or add commentary.',
        },
      ],
    }],
    generationConfig: {
      temperature: 0,
    },
  })

  return transcript
}

async function scoreTranscript(transcript) {
  const text = await callGemini({
    contents: [{
      role: 'user',
      parts: [{
        text: `${TRIAGE_SYSTEM_PROMPT}\n\nTranscript:\n${transcript}`,
      }],
    }],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          y_score_raw: {
            type: 'number',
            description: 'Estimated positive mental wellbeing score on the MHC-SF raw range 0-70.',
          },
          x_score_raw: {
            type: 'number',
            description: 'Estimated psychological distress score on the PHQ-ADS raw range 0-48.',
          },
        },
        required: ['y_score_raw', 'x_score_raw'],
      },
    },
  })

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

  // Store assessment mode only; raw voice/audio/transcript is deliberately not persisted.
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

  return {
    checkin: checkinRows[0],
    recommendations: platforms.slice(0, 3),
  }
}

// ── POST /api/checkins — questionnaire OR voice assessment ───────────────
router.post('/', requireUser, async (req, res) => {
  const { mode = 'questionnaire', answers, audioBase64, mimeType } = req.body || {}

  try {
    if (mode === 'voice') {
      if (!audioBase64) return res.status(400).json({ error: 'Voice recording is required' })

      const transcript = await transcribeVoice(audioBase64, mimeType)
      if (!transcript) return res.status(400).json({ error: 'Could not detect speech in the recording' })

      const { y_score_raw, x_score_raw } = await scoreTranscript(transcript)

      // Conservative explicit-language safety flag. Raw transcript is not persisted.
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

// ── GET /api/checkins — current user's full history ──────────────────────
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
