import logoImg from '../assets/logo.png' 
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { orgsAPI } from '../utils/http'
import { Spinner } from './UI'

const SUPERADMIN_EMAIL = import.meta.env.VITE_SUPERADMIN_EMAIL || 'admin@countor.app'

export function AuthScreen({ onPending }) {
  const { login, signup } = useApp()
  const [mode,       setMode]       = useState('login')
  const [form,       setForm]       = useState({ name:'', email:'', password:'', confirmPassword:'', orgName:'', orgId:'' })
  const [err,        setErr]        = useState('')
  const [success,    setSuccess]    = useState('')
  const [loading,    setLoading]    = useState(false)
  const [agreed,     setAgreed]     = useState(false)
  const [approvedOrgs, setApprovedOrgs] = useState([])

  useEffect(() => {
    orgsAPI.approved().then(setApprovedOrgs).catch(() => {})
  }, [])

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setErr(''); setSuccess('')
    
    // --- VALIDATION BLOCK ---
    if (!form.email || !form.password) { setErr('Please fill in all fields.'); return }
    
    if (mode !== 'login') {
      if (!form.name) { setErr('Please enter your name.'); return }
      if (form.password !== form.confirmPassword) { setErr('Passwords do not match.'); return }
      if (form.password.length < 8) { setErr('Password must be at least 8 characters.'); return }
      if (!agreed) { setErr('You must agree to the Terms of Service and Privacy Policy.'); return }
    }
    // ------------------------

    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await login({ email: form.email, password: form.password })
        if (res && res.pending) onPending(res.user)

      } else if (mode === 'user') {
        await signup({ name: form.name, email: form.email, password: form.password, orgId: form.orgId || null })
        setSuccess('✅ Account created! Please check your email to verify your account before logging in.')

      } else if (mode === 'super') {
        if (form.email !== SUPERADMIN_EMAIL) {
          setErr(`Superadmin email must be ${SUPERADMIN_EMAIL}`)
          setLoading(false); return
        }
        await signup({ name: form.name, email: form.email, password: form.password })
        setSuccess('✅ Superadmin account created! Please check your email to verify your account.')

      } else if (mode === 'org') {
        if (!form.orgName?.trim()) { setErr('Please enter your organisation name.'); setLoading(false); return }
        await signup({ name: form.name, email: form.email, password: form.password, role: 'org_admin', orgName: form.orgName })
        setSuccess('✅ Request submitted! Please check your email to verify your account. You will be notified once the Countor team approves your organisation.')
      }
    } catch (e) {
      setErr(e.message || 'Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const isSubmitDisabled = loading || (mode !== 'login' && !agreed);

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:460 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
           <img 
              src={logoImg} 
              alt="Countor Logo" 
              style={{ display: 'block', margin: '0 auto', width: '60px', height: 'auto', marginBottom: 16 }} 
            />
          <h1 style={{ fontSize:28, marginBottom:4 }}>Countor</h1>
          <p style={{ color:'var(--muted)', fontSize:13 }}>Mental wellness check-in &amp; community</p>
        </div>

        <div className="card" style={{ padding:28 }}>
          {/* Tabs */}
          <div style={{ display:'flex', background:'#F0EDE8', borderRadius:10, padding:4, marginBottom:22, gap:3 }}>
            {[['login','Log In'],['user','Individual'],['org','Organisation'],['super','Superadmin']].map(([m,l]) => (
              <button 
                key={m} 
                onClick={() => { 
                  setMode(m); 
                  setErr(''); 
                  setSuccess('');
                  setAgreed(false); 
                  setForm({ name:'', email:'', password:'', confirmPassword:'', orgName:'', orgId:'' }); 
                }} 
                style={{ flex:1, padding:'7px 4px', borderRadius:8, border:'none', fontSize:11, fontWeight:700, transition:'all .2s', background: mode===m ? 'var(--white)' : 'transparent', color: mode===m ? 'var(--green)' : 'var(--muted)', boxShadow: mode===m ? 'var(--shadow-sm)' : 'none', cursor:'pointer' }}
              >
                {l}
              </button>
            ))}
          </div>

          {mode === 'org' && (
            <div style={{ background:'var(--amber-pale)', border:'1px solid #F5C9A0', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
              <p style={{ fontSize:12, color:'#7A4010', lineHeight:1.6 }}>🏢 <strong>Organisation Admins</strong> get a private dashboard filtered to their org's users. Requires approval from the Countor team.</p>
            </div>
          )}
          {mode === 'super' && (
            <div style={{ background:'var(--red-pale)', border:'1px solid #F1A9A0', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
              <p style={{ fontSize:12, color:'#922B21', lineHeight:1.6 }}>🔐 Restricted to <code style={{ background:'rgba(0,0,0,.06)', padding:'1px 6px', borderRadius:4 }}>{SUPERADMIN_EMAIL}</code> only.</p>
            </div>
          )}

          {/* Form Fields - Only show if not in success state */}
          {!success && (
            <>
              {mode !== 'login' && <Field label="Full Name" value={form.name} onChange={v => up('name',v)} placeholder="Your name" onEnter={submit} />}
              
              <Field label="Email" type="email" value={form.email} onChange={v => up('email',v)} placeholder="you@example.com" onEnter={submit} />

              <Field label="Password" type="password" value={form.password} onChange={v => up('password',v)} placeholder="Min 8 characters" onEnter={submit} />
              
              {mode !== 'login' && (
                <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={v => up('confirmPassword',v)} placeholder="Re-enter your password" onEnter={submit} />
              )}

              {mode === 'org' && (
                <Field label="Organisation Name" value={form.orgName} onChange={v => up('orgName',v)} placeholder="e.g. Infosys, IIT Delhi..." onEnter={submit} />
              )}

              {mode === 'user' && approvedOrgs.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--muted)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.5 }}>Organisation (optional)</label>
                  <select value={form.orgId} onChange={e => up('orgId', e.target.value)}>
                    <option value="">— I'm an individual user —</option>
                    {approvedOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <p style={{ fontSize:11, color:'var(--muted)', marginTop:6 }}>Select if your organisation uses Countor. Your scores will be visible to your org admin.</p>
                </div>
              )}

              {/* Legal Checkbox */}
              {mode !== 'login' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ width: 'auto', marginTop: 4, cursor: 'pointer' }}
                  />
                  <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4 }}>
                    I agree to Countor's <a href="/terms-of-service" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.
                  </label>
                </div>
              )}
            </>
          )}

          {err     && <div style={{ background:'#FDEDEC', border:'1px solid #F1A9A0', borderRadius:8, padding:'10px 14px', marginBottom:14 }}><p style={{ color:'var(--red)', fontSize:13 }}>⚠️ {err}</p></div>}
          {success && <div style={{ background:'var(--green-pale)', border:'1px solid var(--green-pale2)', borderRadius:8, padding:'10px 14px', marginBottom:14 }}><p style={{ color:'var(--green)', fontSize:13 }}>{success}</p></div>}

          {!success ? (
            <button className="btn-primary" onClick={submit} disabled={isSubmitDisabled} style={{ width:'100%', padding:'13px', fontSize:15, justifyContent:'center' }}>
              {loading ? <Spinner /> : mode==='login' ? 'Log In' : mode==='org' ? 'Request Organisation Access' : 'Create Account'}
            </button>
          ) : (
            <button className="btn-outline" onClick={() => { setMode('login'); setSuccess(''); setForm({ name:'', email:'', password:'', confirmPassword:'', orgName:'', orgId:'' }) }} style={{ width:'100%', justifyContent:'center', padding:'13px' }}>
              Back to Log In
            </button>
          )}
        </div>
        <p style={{ textAlign:'center', marginTop:14, fontSize:12, color:'var(--muted)' }}>🔒 Data stored securely in the backend database.</p>
      </div>
    </div>
  )
}

function Field({ label, type='text', value, onChange, placeholder, onEnter }) {
  // Added state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:700, color:'var(--muted)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.5 }}>{label}</label>
      
      {/* Wrapper div to position the eye icon inside the input field */}
      <div style={{ position: 'relative' }}>
        <input 
          // Switch between 'text' and 'password' if the button is clicked
          type={isPasswordType && showPassword ? 'text' : type} 
          placeholder={placeholder} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          onKeyDown={e => e.key==='Enter' && onEnter()} 
          // Add extra padding on the right so text doesn't type *under* the icon
          style={isPasswordType ? { paddingRight: '40px', width: '100%', boxSizing: 'border-box' } : { width: '100%', boxSizing: 'border-box' }}
        />
        
        {/* Only render the toggle button if it's a password field */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1" // Prevents the 'Tab' key from selecting the eye icon while typing
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            {showPassword ? (
              // "Eye Closed" SVG (Hide Password)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              // "Eye Open" SVG (Show Password)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
