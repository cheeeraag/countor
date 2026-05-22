import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { communityAPI } from '../utils/http'
import { Avatar, Spinner } from './UI'

const CATEGORIES = [
  { id:'all',        label:'🏠 All',          color:'#1B5E3B' },
  { id:'general',    label:'💬 General',       color:'#2D7A50' },
  { id:'anxiety',    label:'💭 Anxiety',       color:'#A06030' },
  { id:'depression', label:'🌧 Depression',    color:'#5B6FA0' },
  { id:'stress',     label:'🔥 Work & Stress', color:'#C0392B' },
  { id:'students',   label:'📚 Students',      color:'#7B5EA0' },
  { id:'sleep',      label:'😴 Sleep',         color:'#2471A3' },
  { id:'motivation', label:'⚡ Motivation',    color:'#D4740A' },
  { id:'selfcare',   label:'🌸 Self-care',     color:'#C0715A' },
  { id:'wins',       label:'🎉 Small Wins',    color:'#1B5E3B' },
]
const catMap = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

const FLAIRS = ['Seeking support','Sharing experience','Advice needed','Celebrating a win','Just venting','Question','Resource']

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export function CommunityPage() {
  const { user } = useApp()
  const [posts,    setPosts]    = useState([])
  const [category, setCategory] = useState('all')
  const [sort,     setSort]     = useState('new')
  const [view,     setView]     = useState('feed')   // feed | post | create
  const [active,   setActive]   = useState(null)
  const [fetching, setFetching] = useState(false)

  const loadPosts = useCallback(async () => {
    setFetching(true)
    try { setPosts(await communityAPI.posts(category, sort)) } catch {}
    setFetching(false)
  }, [category, sort])

  useEffect(() => { loadPosts() }, [loadPosts])

  if (view === 'create') return <CreatePost user={user} onSuccess={() => { setView('feed'); loadPosts() }} onBack={() => setView('feed')} />
  if (view === 'post' && active) return <PostDetail post={active} user={user} onBack={() => { setView('feed'); loadPosts() }} />

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'20px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontFamily:"'Lora',serif", marginBottom:4 }}>Community 🌿</h1>
          <p style={{ fontSize:13, color:'var(--muted)' }}>A safe, supportive space to share and connect</p>
        </div>
        <button className="btn-primary" onClick={() => setView('create')}>✏️ New Post</button>
      </div>

      {/* Category tabs */}
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:16, scrollbarWidth:'none' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding:'6px 14px', borderRadius:20, border: category===c.id ? 'none' : '1px solid var(--border)', cursor:'pointer', fontSize:12, fontWeight:700, whiteSpace:'nowrap', transition:'all .15s', background: category===c.id ? c.color : 'var(--white)', color: category===c.id ? '#fff' : 'var(--muted)' }}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:12, color:'var(--muted)' }}>{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
        <div style={{ display:'flex', gap:4 }}>
          {[['new','🕐 New'],['top','⬆️ Top'],['comments','💬 Active']].map(([s,l]) => (
            <button key={s} onClick={() => setSort(s)} style={{ padding:'4px 12px', borderRadius:20, border:'1px solid var(--border)', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all .15s', background: sort===s ? 'var(--green)' : 'transparent', color: sort===s ? '#fff' : 'var(--muted)' }}>{l}</button>
          ))}
        </div>
      </div>

      {fetching ? (
        <div style={{ textAlign:'center', padding:40 }}><Spinner green size={28} /></div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:40 }}>
          <p style={{ fontSize:36, marginBottom:12 }}>🌱</p>
          <p style={{ fontSize:16, fontFamily:"'Lora',serif", marginBottom:8 }}>No posts yet</p>
          <button className="btn-primary" onClick={() => setView('create')}>Write the first post →</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} user={user} onOpen={() => { setActive(post); setView('post') }} onRefresh={loadPosts} />
          ))}
        </div>
      )}

      <div style={{ background:'var(--green-pale)', border:'1px solid var(--green-pale2)', borderRadius:12, padding:'14px 18px', marginTop:24 }}>
        <p style={{ fontSize:12, color:'var(--green)', lineHeight:1.8 }}>
          <strong>Community Guidelines:</strong> Be kind and supportive. No unsolicited advice unless asked. Respect anonymity. No diagnosis or medical advice. Crisis support: <strong>iCall 9152987821</strong>
        </p>
      </div>
    </div>
  )
}

function PostCard({ post, user, onOpen, onRefresh }) {
  const cat     = catMap[post.category] || catMap.general
  const isOwn   = user?.id === post.author_id
  const upvoted = post.upvoted_by_me

  const handleUpvote = async (e) => {
    e.stopPropagation()
    try { await communityAPI.upvotePost(post.id); onRefresh() } catch {}
  }
  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this post?')) return
    try { await communityAPI.deletePost(post.id); onRefresh() } catch {}
  }

  return (
    <div className="card card-hover" onClick={onOpen} style={{ padding:'16px 18px' }}>
      <div style={{ display:'flex', gap:14 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
          <button onClick={handleUpvote} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color: upvoted ? 'var(--amber)' : 'var(--muted)', transition:'color .15s' }}>▲</button>
          <span style={{ fontSize:13, fontWeight:700, color: upvoted ? 'var(--amber)' : 'var(--text)', minWidth:20, textAlign:'center' }}>{post.upvotes}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <span className="badge" style={{ background: cat.color+'18', color: cat.color, fontSize:10 }}>{cat.label}</span>
            <span style={{ fontSize:11, color:'var(--muted)' }}>{post.anonymous ? '👤 Anonymous' : post.author_name} · {timeAgo(post.created_at)}</span>
            {isOwn && <button onClick={handleDelete} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--muted)' }}>🗑 Delete</button>}
          </div>
          <p style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:6, lineHeight:1.4 }}>{post.title}</p>
          {post.body && <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{post.body}</p>}
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:12, color:'var(--muted)' }}>💬 {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</span>
            {post.flair && <span className="badge badge-green" style={{ fontSize:10 }}>{post.flair}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatePost({ user, onSuccess, onBack }) {
  const [form, setForm] = useState({ title:'', body:'', category:'general', anonymous:false, flair:'' })
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!form.title.trim()) { setErr('Please add a title.'); return }
    setBusy(true)
    try { await communityAPI.createPost(form); onSuccess() }
    catch (e) { setErr(e.message) }
    setBusy(false)
  }

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'20px 16px' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom:20 }}>← Back</button>
      <div className="card" style={{ padding:28 }}>
        <h2 style={{ fontSize:20, fontFamily:"'Lora',serif", marginBottom:24 }}>Create a Post</h2>

        <SLabel text="Category *" />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
          {CATEGORIES.filter(c=>c.id!=='all').map(c => (
            <button key={c.id} onClick={() => setForm(f=>({...f,category:c.id}))} style={{ padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, transition:'all .15s', background: form.category===c.id ? c.color : 'var(--cream2)', color: form.category===c.id ? '#fff' : 'var(--muted)' }}>{c.label}</button>
          ))}
        </div>

        <SLabel text="Flair (optional)" />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
          {FLAIRS.map(f => (
            <button key={f} onClick={() => setForm(p=>({...p,flair:p.flair===f?'':f}))} style={{ padding:'4px 10px', borderRadius:20, border:'1px solid var(--border)', cursor:'pointer', fontSize:11, fontWeight:600, transition:'all .15s', background: form.flair===f ? 'var(--green-pale)' : 'transparent', color: form.flair===f ? 'var(--green)' : 'var(--muted)' }}>{f}</button>
          ))}
        </div>

        <SLabel text="Title *" />
        <input type="text" placeholder="What's on your mind?" value={form.title} maxLength={120} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={{ marginBottom:6 }} />
        <p style={{ fontSize:11, color:'var(--muted)', marginBottom:16, textAlign:'right' }}>{form.title.length}/120</p>

        <SLabel text="Details (optional)" />
        <textarea placeholder="Share more if you'd like..." rows={4} value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} style={{ marginBottom:16 }} />

        <div onClick={() => setForm(f=>({...f,anonymous:!f.anonymous}))} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--cream)', borderRadius:10, cursor:'pointer', marginBottom:20 }}>
          <Toggle on={form.anonymous} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:1 }}>Post anonymously</p>
            <p style={{ fontSize:12, color:'var(--muted)' }}>Your name won't be shown to other users.</p>
          </div>
        </div>

        {err && <p style={{ fontSize:13, color:'var(--red)', background:'#FDEDEC', padding:'8px 14px', borderRadius:8, marginBottom:16 }}>{err}</p>}
        <button className="btn-primary" onClick={submit} disabled={busy} style={{ width:'100%', padding:'13px', justifyContent:'center', fontSize:15 }}>
          {busy ? <Spinner /> : 'Publish Post 🚀'}
        </button>
      </div>
    </div>
  )
}

function PostDetail({ post: initial, user, onBack }) {
  const [post,     setPost]     = useState(initial)
  const [comments, setComments] = useState([])
  const [reply,    setReply]    = useState('')
  const [anon,     setAnon]     = useState(false)
  const [sending,  setSending]  = useState(false)

  const cat     = catMap[post.category] || catMap.general
  const upvoted = post.upvoted_by_me

  const refreshComments = async () => {
    try { setComments(await communityAPI.comments(post.id)) } catch {}
  }

  useEffect(() => { refreshComments() }, [post.id])

  const handleUpvote = async () => {
    try {
      const res = await communityAPI.upvotePost(post.id)
      setPost(p => ({ ...p, upvotes: res.upvotes, upvoted_by_me: res.upvoted }))
    } catch {}
  }

  const submitComment = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      const c = await communityAPI.createComment(post.id, { body: reply, anonymous: anon })
      setComments(prev => [...prev, c])
      setPost(p => ({ ...p, comment_count: p.comment_count + 1 }))
      setReply('')
    } catch {}
    setSending(false)
  }

  const handleCommentUpvote = async (c) => {
    try {
      const res = await communityAPI.upvoteComment(c.id)
      setComments(prev => prev.map(x => x.id === c.id ? { ...x, upvotes: res.upvotes, upvoted_by_me: res.upvoted } : x))
    } catch {}
  }

  const handleDeleteComment = async (id) => {
    if (!confirm('Delete this comment?')) return
    try {
      await communityAPI.deleteComment(id)
      setComments(prev => prev.filter(c => c.id !== id))
      setPost(p => ({ ...p, comment_count: Math.max(0, p.comment_count - 1) }))
    } catch {}
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'20px 16px 40px' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom:20 }}>← Back to Community</button>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', gap:14 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
            <button onClick={handleUpvote} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color: upvoted ? 'var(--amber)' : 'var(--muted)' }}>▲</button>
            <span style={{ fontSize:14, fontWeight:700, color: upvoted ? 'var(--amber)' : 'var(--text)' }}>{post.upvotes}</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
              <span className="badge" style={{ background: cat.color+'18', color: cat.color }}>{cat.label}</span>
              {post.flair && <span className="badge badge-green">{post.flair}</span>}
              <span style={{ fontSize:12, color:'var(--muted)' }}>{post.anonymous ? '👤 Anonymous' : post.author_name} · {timeAgo(post.created_at)}</span>
            </div>
            <h2 style={{ fontSize:19, fontFamily:"'Lora',serif", fontWeight:600, marginBottom:12, lineHeight:1.4 }}>{post.title}</h2>
            {post.body && <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{post.body}</p>}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 }}>💬 {comments.length} Comment{comments.length !== 1 ? 's' : ''}</p>

        <div style={{ background:'var(--cream)', borderRadius:12, padding:16, marginBottom:20 }}>
          <textarea placeholder="Share your thoughts, support, or experience..." value={reply} onChange={e=>setReply(e.target.value)} rows={3} style={{ marginBottom:10, background:'var(--white)', resize:'none' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--muted)' }}>
              <div onClick={()=>setAnon(a=>!a)}><Toggle on={anon} /></div>
              Post anonymously
            </label>
            <button className="btn-primary" onClick={submitComment} disabled={!reply.trim()||sending} style={{ padding:'8px 18px', opacity:!reply.trim()?.5:1 }}>
              {sending ? <Spinner /> : 'Comment →'}
            </button>
          </div>
        </div>

        {comments.length === 0
          ? <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13, padding:'20px 0' }}>No comments yet. Be the first to support! 💚</p>
          : <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[...comments].sort((a,b)=>b.upvotes-a.upvotes||new Date(a.created_at)-new Date(b.created_at)).map(c => (
                <div key={c.id} style={{ display:'flex', gap:12, padding:'12px 14px', background:'var(--cream)', borderRadius:10 }}>
                  <Avatar initials={c.anonymous ? '??' : c.author_name?.slice(0,2).toUpperCase()} size={36} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>
                        {c.anonymous ? '👤 Anonymous' : c.author_name}
                        <span style={{ fontWeight:400, color:'var(--muted)', marginLeft:8 }}>{timeAgo(c.created_at)}</span>
                      </span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <button onClick={() => handleCommentUpvote(c)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color: c.upvoted_by_me ? 'var(--amber)' : 'var(--muted)', display:'flex', alignItems:'center', gap:4 }}>▲ {c.upvotes}</button>
                        {c.author_id === user?.id && <button onClick={() => handleDeleteComment(c.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--muted)' }}>🗑</button>}
                      </div>
                    </div>
                    <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.65, whiteSpace:'pre-wrap' }}>{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      <div style={{ background:'var(--amber-pale)', border:'1px solid #F5C9A0', borderRadius:10, padding:'12px 16px' }}>
        <p style={{ fontSize:12, color:'#7A4010', lineHeight:1.6 }}>💛 This is peer support, not therapy. If in crisis: <strong>iCall 9152987821</strong></p>
      </div>
    </div>
  )
}

function SLabel({ text }) {
  return <p style={{ fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>{text}</p>
}

function Toggle({ on }) {
  return (
    <div style={{ width:30, height:16, borderRadius:8, background: on ? 'var(--green)' : 'var(--border)', position:'relative', transition:'background .2s', cursor:'pointer', flexShrink:0 }}>
      <div style={{ width:12, height:12, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: on ? 16 : 2, transition:'left .2s' }} />
    </div>
  )
}
