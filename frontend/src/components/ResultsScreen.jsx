import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageShell } from './UI';

export function ResultsScreen({ result, onDashboard }) {
  // 1. Properly extract BOTH the checkin scores and the recommendations array from the backend payload
  const checkin = result?.checkin || result || {};
  const recommendations = result?.recommendations || [];
  
  const xNorm = checkin.x_score_norm || 0;
  const yNorm = checkin.y_score_norm || 0;
  const isCrisis = checkin.suicidality_flag;

  const data = [{ x: xNorm, y: yNorm }];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '12px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Your Coordinates</p>
          <p style={{ margin: 0 }}>Distress Index: {payload[0].value}%</p>
          <p style={{ margin: 0 }}>Well-being Index: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageShell>
      {/* 2D Gradient Scatter Chart */}
      <div className="card scale-in" style={{ padding: '32px 20px', marginBottom: 24, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 8, fontSize: 22, fontFamily: "'Lora', serif" }}>The Mental Health Matrix</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          Well-being (Y): <strong>{yNorm}%</strong> | Distress (X): <strong>{xNorm}%</strong>
        </p>

        <div style={{ width: '100%', height: 350, maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FADBD8" stopOpacity={0.8} />   {/* Top Left: Distress */}
                  <stop offset="50%" stopColor="#FFF3E0" stopOpacity={0.6} />  {/* Center Gradient */}
                  <stop offset="100%" stopColor="#E8F5EE" stopOpacity={0.8} /> {/* Bottom Right: Healthy */}
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              
              {/* 2. Removed hide={true} to make the 0-100 axes numbers visible */}
              <XAxis type="number" dataKey="x" name="Distress" domain={[100, 0]} reversed={true} />
              <YAxis type="number" dataKey="y" name="Wellbeing" domain={[0, 100]} />
              
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={data} fill="#1B5E3B" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Safety Alert Modal/Banner */}
      {isCrisis && (
        <div style={{ background: '#FFF0F0', border: '1px solid #FFCDCD', padding: 20, borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>
          <h3 style={{ color: '#D32F2F', marginBottom: 8 }}>Emergency Support</h3>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
            Based on your answers, you indicated feeling overwhelmed. Please consider connecting with a trained support listener.
          </p>
          <a href="tel:9820466726" style={{ display: 'inline-block', marginTop: 12, padding: '10px 20px', background: '#D32F2F', color: '#FFF', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
            Call AASRA Crisis Helpline: 9820466726
          </a>
        </div>
      )}

      {/* Tailored Platform Recommendations */}
      <h3 style={{ marginBottom: 16, fontFamily: "'Lora', serif" }}>Personalized Matches For You</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {recommendations.length > 0 ? (
          recommendations.map((p, i) => (
            <div key={i} className="card" style={{ padding: 20, border: '1px solid var(--border)' }}>
              <h4 style={{ margin: 0, fontSize: 16, color: 'var(--green)' }}>{p.name}</h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, marginBottom: 16, lineHeight: 1.5 }}>{p.prop}</p>
              <a href={p.url} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: 13, display: 'inline-flex', padding: '8px 16px', textDecoration: 'none' }}>
                Visit Platform →
              </a>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>No exact matches found. Please ensure the platforms database is seeded.</p>
          </div>
        )}
      </div>

      <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={onDashboard}>
        Go to Dashboard
      </button>
    </PageShell>
  );
}
