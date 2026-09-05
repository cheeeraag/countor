import logoImg from '../assets/logo.png'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { orgsAPI } from '../utils/http'
import { Spinner } from './UI'
import '../styles/auth.css'

const SUPERADMIN_EMAIL = import.meta.env.VITE_SUPERADMIN_EMAIL || 'admin@countor.app'

export function AuthScreen({ onPending }) {
  const { login, signup } = useApp()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', orgName:'', orgId:'' })
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [approvedOrgs, setApprovedOrgs] = useState([])

  useEffect(() => { orgsAPI.approved().then(setApprovedOrgs).catch(() => {}) }, [])
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setErr(''); setSuccess('')
    if (!form.email || !form.password) { setErr('Please fill in all fields.'); return }
    if (mode !== 'login') {
      if (!form.name) { setErr('Please enter your name.'); return }
      if (form.password !== form.confirmPassword) { setErr('Passwords do not match.'); return }
      if (form.password.length < 8) { setErr('Password must be at least 8 characters.'); return }
      if (!agreed) { setErr('You must agree to the Terms of Service and Privacy Policy.'); return }
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await login({ email: form.email, password: form.password })
        if (res && res.pending) onPending(res.user)
      } else if (mode === 'user') {
        await signup({ name: form.name, email: form.email, password: form.password, orgId: form.orgId || null })
      } else if (mode === 'super') {
        if (form.email !== SUPERADMIN_EMAIL) {
          setErr(`Superadmin email must be ${SUPERADMIN_EMAIL}`); setLoading(false); return
        }
        await signup({ name: form.name, email: form.email, password: form.password })
      } else if (mode === 'org') {
        if (!form.orgName?.trim()) { setErr('Please enter your organisation name.'); setLoading(false); return }
        await signup({ name: form.name, email: form.email, password: form.password, role: 'org_admin', orgName: form.orgName })
        setSuccess('Request submitted! You will be notified once the Countor team approves your organisation.')
      }
    } catch (e) { setErr(e.message || 'Something went wrong. Please try again.') }
    setLoading(false)
  }

  const isSubmitDisabled = loading || (mode !== 'login' && !agreed)
  const switchMode = m => {
    setMode(m); setErr(''); setSuccess(''); setAgreed(false)
    setForm({ name:'', email:'', password:'', confirmPassword:'', orgName:'', orgId:'' })
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <img src={logoImg} alt="Countor Logo" className="auth-logo" />
          <h1>Countor</h1>
          <p>Mental wellness check-in &amp; community</p>
        </div>

        <div className="card auth-card">
          <div className="auth-tabs">
            {[['login','Log In'],['user','Individual'],['org','Organisation'],['super','Superadmin']].map(([m,l]) => (
              <button key={m} onClick={() => switchMode(m)} className={`auth-tab ${mode===m ? 'active' : ''}`}>{l}</button>
            ))}
          </div>

          {mode === 'org' && <div className="auth-notice amber"><span>🏢</span><p><strong>Organisation Admins</strong> get a private dashboard filtered to their organisation's users. Requires approval from the Countor team.</p></div>}
          {mode === 'super' && <div className="auth-notice red"><span>🔐</span><p>Restricted to <code>{SUPERADMIN_EMAIL}</code> only.</p></div>}

          {!success && <>
            {mode !== 'login' && <Field label="Full Name" value={form.name} onChange={v => up('name',v)} placeholder="Your name" onEnter={submit} />}
            <Field label="Email" type="email" value={form.email} onChange={v => up('email',v)} placeholder="you@example.com" onEnter={submit} />
            <Field label="Password" type="password" value={form.password} onChange={v => up('password',v)} placeholder="Min 8 characters" onEnter={submit} />
            {mode !== 'login' && <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={v => up('confirmPassword',v)} placeholder="Re-enter your password" onEnter={submit} />}
            {mode === 'org' && <Field label="Organisation Name" value={form.orgName} onChange={v => up('orgName',v)} placeholder="e.g. Infosys, IIT Delhi..." onEnter={submit} />}
            {mode === 'user' && approvedOrgs.length > 0 && (
              <div className="auth-field">
                <label>Organisation <span>(optional)</span></label>
                <select className="auth-input" value={form.orgId} onChange={e => up('orgId', e.target.value)}>
                  <option value="">— I'm an individual user —</option>
                  {approvedOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                <p className="auth-helper">Select if your organisation uses Countor. Your scores will be visible to your org admin.</p>
              </div>
            )}
            {mode !== 'login' && <div className="auth-terms">
              <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label htmlFor="terms">I agree to Countor's <a href="/terms-of-service" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.</label>
            </div>}
          </>}

          {err && <div className="auth-alert error"><span>⚠️</span><p>{err}</p></div>}
          {success && <div className="auth-alert success"><span>✓</span><p>{success}</p></div>}

          {!success ? <button className="btn-primary auth-submit" onClick={submit} disabled={isSubmitDisabled}>{loading ? <Spinner /> : mode==='login' ? 'Log In' : mode==='org' ? 'Request Organisation Access' : 'Create Account'}</button>
            : <button className="btn-outline auth-submit" onClick={() => { switchMode('login') }}>Back to Log In</button>}
        </div>
        <p className="auth-security">🔒 <span>Data stored securely in the backend database.</span></p>
      </div>
    </div>
  )
}

function Field({ label, type='text', value, onChange, placeholder, onEnter }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordType = type === 'password'
  return (
    <div className="auth-field">
      <label>{label}</label>
      <div className="auth-input-wrap">
        <input className="auth-input" type={isPasswordType && showPassword ? 'text' : type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key==='Enter' && onEnter()} />
        {isPasswordType && <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex="-1" aria-label={showPassword ? 'Hide password' : 'Show password'}>
          {showPassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
        </button>}
      </div>
    </div>
  )
}
