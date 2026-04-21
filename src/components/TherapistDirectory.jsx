import { useState, useMemo } from 'react'
import { THERAPISTS } from '../data/recommendations'
import { PageShell, SectionHeader, StarRating, Avatar, EmptyState } from './UI'

const SPECIALTIES = ['All', 'Anxiety & Depression', 'Stress & Burnout', 'Trauma & PTSD', 'Student & Academic Stress', 'Relationship & Life Transitions', 'Addiction & Recovery', 'Mindfulness & Wellness', 'Depression & Mood Disorders']

export function TherapistDirectory() {
  const [search,    setSearch]    = useState('')
  const [specialty, setSpecialty] = useState('All')
  const [maxFee,    setMaxFee]    = useState(2500)
  const [selected,  setSelected]  = useState(null)

  const filtered = useMemo(() => {
    return THERAPISTS.filter(t => {
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.specialty.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      const matchSpecialty = specialty === 'All' || t.specialty === specialty
      const matchFee = t.sessionFee <= maxFee
      return matchSearch && matchSpecialty && matchFee
    })
  }, [search, specialty, maxFee])

  if (selected) {
    return <TherapistDetail therapist={selected} onBack={() => setSelected(null)} />
  }

  return (
    <PageShell>
      <SectionHeader
        icon="👩‍⚕️"
        title="Therapist Directory"
        subtitle="RCI-licensed mental health professionals available online"
      />

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="search"
              placeholder="Search by name, specialty, or therapy type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <select value={specialty} onChange={e => setSpecialty(e.target.value)} style={{ minWidth: 200 }}>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Max fee: ₹{maxFee}/session</label>
          <input
            type="range" min={500} max={2500} step={100}
            value={maxFee}
            onChange={e => setMaxFee(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        Showing <strong style={{ color: 'var(--green)' }}>{filtered.length}</strong> therapists
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(t => (
            <TherapistCard key={t.id} therapist={t} onSelect={() => setSelected(t)} />
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            emoji="🔍"
            title="No therapists found"
            desc="Try adjusting your filters or increasing the fee range."
            action={<button className="btn-outline" onClick={() => { setSearch(''); setSpecialty('All'); setMaxFee(2500) }}>Clear Filters</button>}
          />
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
        All therapists are RCI-licensed or hold equivalent qualifications.<br />
        ⚠️ Countor does not have a referral relationship with listed therapists.
      </p>
    </PageShell>
  )
}

function TherapistCard({ therapist: t, onSelect }) {
  return (
    <div className="card card-hover" onClick={onSelect} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Avatar initials={t.avatar} size={52} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>{t.name}</p>
            <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{t.specialty}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>₹{t.sessionFee}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>/session</span></p>
            <StarRating rating={t.rating} />
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{t.reviews} reviews</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, marginBottom: 10 }}>{t.qualification} · {t.location}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {t.tags.map(tag => <span key={tag} className="badge badge-green" style={{ fontSize: 11 }}>{tag}</span>)}
          {t.languages.map(l => <span key={l} className="badge badge-gray" style={{ fontSize: 10 }}>🌐 {l}</span>)}
        </div>
      </div>
    </div>
  )
}

function TherapistDetail({ therapist: t, onBack }) {
  return (
    <PageShell>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 16, fontSize: 14 }}>← Back to Directory</button>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <Avatar initials={t.avatar} size={64} />
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{t.name}</h2>
            <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 600 }}>{t.specialty}</p>
            <StarRating rating={t.rating} />
          </div>
        </div>

        {[
          { label: 'Qualification', value: t.qualification },
          { label: 'Location', value: t.location },
          { label: 'Languages', value: t.languages.join(', ') },
          { label: 'Session Fee', value: `₹${t.sessionFee} per session` },
          { label: 'Reviews', value: `${t.reviews} verified reviews` },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{row.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text)', textAlign: 'right' }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Specialisations</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {t.tags.map(tag => <span key={tag} className="badge badge-green">{tag}</span>)}
        </div>
      </div>

      <div style={{ background: 'var(--green-pale)', border: '1.5px solid var(--green)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--green)', lineHeight: 1.7 }}>
          📌 <strong>How to Book:</strong> Search for {t.name} on platforms like Practo, Lybrate, or the therapist's own website. You can also try platforms like Lissun, Rocket Health, or Dost for easy online booking.
        </p>
      </div>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}>
        🔍 Search "{t.name}" Online
      </button>
    </PageShell>
  )
}
