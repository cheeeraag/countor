import { useState } from 'react'
import { getUsers, saveUser } from '../utils/storage'
import { useApp } from '../context/AppContext'
import { Spinner } from './UI'

export function AuthScreen() {
  const { login } = useApp()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const submit = async () => {
    setErr('')
    if (!form.email || !form.password) { setErr('Please fill in all fields.'); return }
    if (mode === 'signup' && !form.name) { setErr('Please enter your name.'); return }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 400)) // small UX delay

    const users = getUsers()

    if (mode === 'signup') {
      if (users[form.email]) { setErr('An account already exists. Please log in.'); setLoading(false); return }
      saveUser(form.email, { name: form.name, email: form.email, password: form.password })
      login({ name: form.name, email: form.email })
    } else {
      if (!users[form.email]) { setErr('No account found. Please sign up first.'); setLoading(false); return }
      if (users[form.email].password !== form.password) { setErr('Incorrect password.'); setLoading(false); return }
      login({ name: users[form.email].name, email: form.email })
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--cream)', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, background: 'var(--green)',
            borderRadius: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', fontSize: 30,
            boxShadow: '0 8px 24px rgba(27,94,59,.25)',
          }}>🧠</div>
          <h1 style={{ fontSize: 30, color: 'var(--text)', marginBottom: 6 }}>Countor</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your mental wellness check-in companion</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28, boxShadow: 'var(--shadow-lg)' }}>
          {/* Tab Toggle */}
          <div style={{ display: 'flex', background: '#F0EDE8', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setErr('') }}
                style={{
                  flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: 700, transition: 'all .2s',
                  background: mode === m ? 'var(--white)' : 'transparent',
                  color: mode === m ? 'var(--green)' : 'var(--muted)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                }}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <Field label="Your Name" value={form.name} onChange={v => update('name', v)} placeholder="Ananya / Rohit..." onEnter={submit} />
          )}
          <Field label="Email" type="email" value={form.email} onChange={v => update('email', v)} placeholder="you@example.com" onEnter={submit} />
          <Field label="Password" type="password" value={form.password} onChange={v => update('password', v)} placeholder="••••••••" onEnter={submit} last />

          {err && (
            <div style={{ background: '#FDEDEC', border: '1px solid #F1A9A0', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: 'var(--red)', fontSize: 13 }}>⚠️ {err}</p>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={submit}
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: 15, justifyContent: 'center' }}
          >
            {loading ? <Spinner /> : mode === 'login' ? 'Log In →' : 'Create Account →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr('') }}
              style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          🔒 Private & secure. Data stored locally. No sensitive info shared.
        </p>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, onEnter, last = false }) {
  return (
    <div style={{ marginBottom: last ? 20 : 14 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter()}
      />
    </div>
  )
}
