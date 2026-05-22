const router = require('express').Router()
const pool   = require('../db')
const { requireUser } = require('../middleware/roles')
const { optionalToken } = require('../middleware/auth')

// ── GET /api/posts — feed with optional category filter ───────────────────
router.get('/', optionalToken, async (req, res) => {
  const { category, sort = 'new' } = req.query
  const userId = req.user?.id || null

  const orderBy = sort === 'top'
    ? 'p.upvotes DESC, p.created_at DESC'
    : sort === 'comments'
      ? 'p.comment_count DESC, p.created_at DESC'
      : 'p.created_at DESC'

  try {
    const { rows } = await pool.query(`
      SELECT
        p.id, p.title, p.body, p.category, p.flair,
        p.anonymous, p.upvotes, p.comment_count, p.created_at,
        u.name  AS author_name,
        u.id    AS author_id,
        CASE WHEN pu.user_id IS NOT NULL THEN true ELSE false END AS upvoted_by_me
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN post_upvotes pu ON pu.post_id = p.id AND pu.user_id = $1
      ${category && category !== 'all' ? 'WHERE p.category = $2' : ''}
      ORDER BY ${orderBy}
      LIMIT 100
    `, category && category !== 'all' ? [userId, category] : [userId])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

// ── POST /api/posts — create post ─────────────────────────────────────────
router.post('/', requireUser, async (req, res) => {
  const { title, body = '', category = 'general', flair = '', anonymous = false } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' })

  try {
    const { rows } = await pool.query(
      `INSERT INTO posts (author_id, title, body, category, flair, anonymous)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, title.trim(), body.trim(), category, flair, anonymous]
    )
    const post = rows[0]
    res.json({ ...post, author_name: req.user.name, upvoted_by_me: false })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT author_id FROM posts WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Post not found' })
    if (rows[0].author_id !== req.user.id && req.user.role !== 'superadmin')
      return res.status(403).json({ error: 'Not your post' })

    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id])
    res.json({ message: 'Deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// ── POST /api/posts/:id/upvote — toggle upvote ────────────────────────────
router.post('/:id/upvote', requireUser, async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const existing = await client.query(
      'SELECT 1 FROM post_upvotes WHERE user_id=$1 AND post_id=$2',
      [req.user.id, req.params.id]
    )

    if (existing.rows.length) {
      await client.query('DELETE FROM post_upvotes WHERE user_id=$1 AND post_id=$2', [req.user.id, req.params.id])
      await client.query('UPDATE posts SET upvotes = upvotes - 1 WHERE id=$1', [req.params.id])
    } else {
      await client.query('INSERT INTO post_upvotes (user_id, post_id) VALUES ($1,$2)', [req.user.id, req.params.id])
      await client.query('UPDATE posts SET upvotes = upvotes + 1 WHERE id=$1', [req.params.id])
    }

    const { rows } = await client.query('SELECT upvotes FROM posts WHERE id=$1', [req.params.id])
    await client.query('COMMIT')
    res.json({ upvotes: rows[0].upvotes, upvoted: !existing.rows.length })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Failed to upvote' })
  } finally {
    client.release()
  }
})

// ── GET /api/posts/:id/comments ───────────────────────────────────────────
router.get('/:id/comments', optionalToken, async (req, res) => {
  const userId = req.user?.id || null
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id, c.body, c.anonymous, c.upvotes, c.created_at,
        u.name  AS author_name,
        u.id    AS author_id,
        CASE WHEN cu.user_id IS NOT NULL THEN true ELSE false END AS upvoted_by_me
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN comment_upvotes cu ON cu.comment_id = c.id AND cu.user_id = $1
      WHERE c.post_id = $2
      ORDER BY c.upvotes DESC, c.created_at ASC
    `, [userId, req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// ── POST /api/posts/:id/comments ─────────────────────────────────────────
router.post('/:id/comments', requireUser, async (req, res) => {
  const { body, anonymous = false } = req.body
  if (!body?.trim()) return res.status(400).json({ error: 'Comment body is required.' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `INSERT INTO comments (post_id, author_id, body, anonymous)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, req.user.id, body.trim(), anonymous]
    )
    await client.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id=$1', [req.params.id])
    await client.query('COMMIT')
    res.json({ ...rows[0], author_name: req.user.name, upvoted_by_me: false })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Failed to post comment' })
  } finally {
    client.release()
  }
})

// ── DELETE /api/comments/:id ──────────────────────────────────────────────
router.delete('/comments/:id', requireUser, async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      'SELECT author_id, post_id FROM comments WHERE id=$1', [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Comment not found' })
    if (rows[0].author_id !== req.user.id && req.user.role !== 'superadmin')
      return res.status(403).json({ error: 'Not your comment' })

    await client.query('DELETE FROM comments WHERE id=$1', [req.params.id])
    await client.query('UPDATE posts SET comment_count = GREATEST(comment_count-1,0) WHERE id=$1', [rows[0].post_id])
    await client.query('COMMIT')
    res.json({ message: 'Deleted' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Failed to delete comment' })
  } finally {
    client.release()
  }
})

// ── POST /api/comments/:id/upvote ─────────────────────────────────────────
router.post('/comments/:id/upvote', requireUser, async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existing = await client.query(
      'SELECT 1 FROM comment_upvotes WHERE user_id=$1 AND comment_id=$2',
      [req.user.id, req.params.id]
    )
    if (existing.rows.length) {
      await client.query('DELETE FROM comment_upvotes WHERE user_id=$1 AND comment_id=$2', [req.user.id, req.params.id])
      await client.query('UPDATE comments SET upvotes = upvotes - 1 WHERE id=$1', [req.params.id])
    } else {
      await client.query('INSERT INTO comment_upvotes (user_id, comment_id) VALUES ($1,$2)', [req.user.id, req.params.id])
      await client.query('UPDATE comments SET upvotes = upvotes + 1 WHERE id=$1', [req.params.id])
    }
    const { rows } = await client.query('SELECT upvotes FROM comments WHERE id=$1', [req.params.id])
    await client.query('COMMIT')
    res.json({ upvotes: rows[0].upvotes, upvoted: !existing.rows.length })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Failed to upvote comment' })
  } finally {
    client.release()
  }
})

module.exports = router
