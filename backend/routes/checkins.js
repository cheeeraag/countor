const router = require('express').Router()
const pool   = require('../db')
const { requireUser } = require('../middleware/roles')

// ── POST /api/checkins — save assessment & fetch recommendations ──────────
router.post('/', requireUser, async (req, res) => {
  const { answers } = req.body
  const today = new Date().toISOString().split('T')[0]

  try {
    // 1. Calculate Y Raw Score (MHC-SF Q1-Q14)
    let y_score_raw = 0;
    for (let i = 1; i <= 14; i++) {
      y_score_raw += (answers[`q${i}`] || 0);
    }

    // 2. Calculate X Raw Score (PHQ-ADS Q15-Q30)
    let x_score_raw = 0;
    for (let i = 15; i <= 30; i++) {
      x_score_raw += (answers[`q${i}`] || 0);
    }

    // 3. Normalize to 0-100 scale
    const y_score_norm = parseFloat(((y_score_raw / 70) * 100).toFixed(2));
    const x_score_norm = parseFloat(((x_score_raw / 48) * 100).toFixed(2));

    // 4. Safety Override (PHQ-9 Item 9 is Q23)
    const suicidality_flag = (answers['q23'] > 0);

    // 5. Save/Update Check-in Record
    const { rows: checkinRows } = await pool.query(
      `INSERT INTO checkins (user_id, date, y_score_raw, x_score_raw, y_score_norm, x_score_norm, suicidality_flag, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, date)
       DO UPDATE SET y_score_raw=$3, x_score_raw=$4, y_score_norm=$5, x_score_norm=$6, suicidality_flag=$7, answers=$8, created_at=NOW()
       RETURNING *`,
      [req.user.id, today, y_score_raw, x_score_raw, y_score_norm, x_score_norm, suicidality_flag, JSON.stringify(answers || {})]
    )

    // 6. Euclidean Distance Platform Engine
    const { rows: platforms } = await pool.query(`SELECT * FROM platforms`)

    platforms.forEach(p => {
      // D = sqrt((Ux - Px)^2 + (Uy - Py)^2)
      p.distance = Math.sqrt(
        Math.pow(x_score_norm - p.anchor_x, 2) + 
        Math.pow(y_score_norm - p.anchor_y, 2)
      );
    });

    // Sort by shortest distance and pick top 3
    platforms.sort((a, b) => a.distance - b.distance);
    const topRecommendations = platforms.slice(0, 3);

    res.json({
      checkin: checkinRows[0],
      recommendations: topRecommendations
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save check-in' })
  }
})

// ── GET /api/checkins — current user's full history ───────────────────────
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
