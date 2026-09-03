const router = require('express').Router()
const pool = require('../db')
const { requireUser } = require('../middleware/roles')

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const VOICE_MAX_BYTES = 15 * 1024 * 1024
const GEMINI_MAX_ATTEMPTS = 3
const GEMINI_RETRY_DELAYS_MS = [1000, 2500]
const GEMINI_REQUEST_TIMEOUT_MS = 60000

const TRIAGE_SYSTEM_PROMPT = `You are Countor's structured mental-wellness assessment scorer.

The user has provided a free-form account of their day or current thoughts. Based ONLY on what is actually supported by the transcript, estimate a response for each of the 30 assessment questions below. Do not ask follow-up questions.

The questions are:
Q1: In the past month, how often did you feel happy?
Q2: In the past month, how often did you feel interested in life?
Q3: In the past month, how often did you feel satisfied with life?
Q4: In the past month, how often did you feel that you had something important to contribute to society?
Q5: In the past month, how often did you feel that you belonged to a community (like a social group, your neighborhood, your city)?
Q6: In the past month, how often did you feel that our society is becoming a better place for all people?
Q7: In the past month, how often did you feel that people are basically good?
Q8: In the past month, how often did you feel that the way our society works makes sense to you?
Q9: In the past month, how often did you feel that you liked most parts of your personality?
Q10: In the past month, how often did you feel good at managing the responsibilities of your daily life?
Q11: In the past month, how often did you feel that you had warm and trusting relationships with others?
Q12: In the past month, how often did you feel that you had experiences that challenged you to grow and become a better person?
Q13: In the past month, how often did you feel confident to think or express your own ideas and opinions?
Q14: In the past month, how often did you feel that your life has a sense of direction or meaning to it?
Q15: Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?
Q16: Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?
Q17: Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?
Q18: Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?
Q19: Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?
Q20: Over the last 2 weeks, how often have you been bothered by feeling bad about yourself, feeling like a failure, or letting yourself or your family down?
Q21: Over the last 2 weeks, how often have you been bothered by trouble concentrating on things?
Q22: Over the last 2 weeks, how often have you been bothered by moving or speaking slowly or being fidgety/restless?
Q23: Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead or of hurting yourself in some way?
Q24: Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?
Q25: Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?
Q26: Over the last 2 weeks, how often have you been bothered by worrying too much about different things?
Q27: Over the last 2 weeks, how often have you been bothered by trouble relaxing?
Q28: Over the last 2 weeks, how often have you been bothered by being so restless that it is hard to sit still?
Q29: Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?
Q30: Over the last 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?

Response scales:
- Q1-Q14 are MHC-SF-style wellbeing items. Use integer 0-5: 0=Never, 1=Once or twice, 2=About once a week, 3=About 2 to 3 times a week, 4=Almost every day, 5=Every day.
- Q15-Q30 are PHQ-ADS component items. Use integer 0-3: 0=Not at all, 1=Several days, 2=More than half the days, 3=Nearly every day.

Critical rules:
- Use ONLY evidence in the transcript. Do not use demographic assumptions, personality assumptions, writing/speech style, or stereotypes.
- Estimate the frequency that best matches the user's statements, even if the user did not answer the question explicitly.
- Do NOT ask for additional information.
- If a question is not meaningfully supported by the transcript, use a neutral conservative estimate: 2 for Q1-Q14 and 1 for Q15-Q30. Do not treat missing information as evidence of illness.
- Do not infer a clinical symptom merely because the user mentions a bad day, procrastination, boredom, frustration, stress from a normal workload, or low productivity.
- Positive wellbeing and distress are independent; a person may have both.
- Q23 is a safety item. Only score it above 0 when the transcript provides actual evidence of thoughts of death or self-harm. Do not infer it from general sadness or stress.
- This is an ESTIMATE from unstructured language, not an actual administration of MHC-SF or PHQ-ADS. Do not diagnose or claim equivalence to a validated questionnaire.

Return ONLY valid JSON with exactly these 30 keys: q1 through q30. Values must be integers within the specified ranges. No markdown, explanation, labels, confidence fields, or extra keys.`

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

  const normalizedMimeType = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase()

  console.log(`[Gemini] Transcription input audioBytes=${buffer.length} mimeType=${normalizedMimeType}`)
  const startedAt = Date.now()
  const result = await callGemini({
    operation: 'transcription',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: normalizedMimeType, data: audioBase64 } },
        { text: 'Transcribe this audio exactly as spoken. Return only the transcript text. Do not summarize, interpret, diagnose, or add commentary.' },
      ],
    }],
  })
  console.log(`[Gemini] Transcription completed elapsedMs=${Date.now() - startedAt} transcriptChars=${result.length}`)
  return result
}

async function scoreTranscript(transcript) {
  console.log(`[Gemini] 30-question estimation input transcriptChars=${transcript.length}`)
  const startedAt = Date.now()
  const text = await callGemini({
    operation: '30-question estimation',
    contents: [{
      role: 'user',
      parts: [{ text: `${TRIAGE_SYSTEM_PROMPT}\n\nTranscript:\n${transcript}` }],
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: Object.fromEntries(Array.from({ length: 30 }, (_, index) => {
          const questionNumber = index + 1
          return [`q${questionNumber}`, {
            type: 'INTEGER',
            minimum: questionNumber <= 14 ? 0 : 0,
            maximum: questionNumber <= 14 ? 5 : 3,
            description: questionNumber <= 14 ? 'Estimated MHC-SF-style frequency, integer 0-5.' : 'Estimated PHQ-ADS component frequency, integer 0-3.',
          }]
        })),
        required: Array.from({ length: 30 }, (_, index) => `q${index + 1}`),
      },
    },
  })
  console.log(`[Gemini] 30-question estimation completed elapsedMs=${Date.now() - startedAt}`)

  let parsed
  try {
    parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim())
  } catch {
    throw new Error('Gemini 30-question estimation returned invalid JSON')
  }

  const estimatedAnswers = {}
  for (let i = 1; i <= 30; i++) {
    const key = `q${i}`
    const value = Number(parsed[key])
    const max = i <= 14 ? 5 : 3
    if (!Number.isFinite(value)) throw new Error(`Gemini returned invalid answer for ${key}`)
    estimatedAnswers[key] = Math.round(clamp(value, 0, max))
  }

  let y_score_raw = 0
  for (let i = 1; i <= 14; i++) y_score_raw += estimatedAnswers[`q${i}`]

  let x_score_raw = 0
  for (let i = 15; i <= 30; i++) x_score_raw += estimatedAnswers[`q${i}`]

  console.log(`[Gemini] Derived scores from estimated answers y=${y_score_raw}/70 x=${x_score_raw}/48`)

  return { estimatedAnswers, y_score_raw, x_score_raw }
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

async function saveAndRecommend({ userId, mode, y_score_raw, x_score_raw, safetyFlag = false, answers = null }) {
  const today = new Date().toISOString().split('T')[0]
  const y_score_norm = parseFloat(((y_score_raw / 70) * 100).toFixed(2))
  const x_score_norm = parseFloat(((x_score_raw / 48) * 100).toFixed(2))
  const storedAnswers = JSON.stringify(mode === 'voice' ? { mode, estimated_answers: answers } : { mode, answers })

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

      const { estimatedAnswers, y_score_raw, x_score_raw } = await scoreTranscript(transcript)
      const safetyFlag = estimatedAnswers.q23 > 0 || /\b(kill myself|killing myself|suicide|suicidal|self[- ]?harm|hurt myself|harm myself|better off dead|want to die|wish i were dead)\b/i.test(transcript)

      return res.json(await saveAndRecommend({
        userId: req.user.id,
        mode: 'voice',
        y_score_raw,
        x_score_raw,
        safetyFlag,
        answers: estimatedAnswers,
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
      answers,
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
