// ─── The 30 Assessment Questions (14 MHC-SF + 16 PHQ-ADS) ─────────────────────
export const QUESTIONS = [
  { id: 'q1',  section: 'Well-being', sectionIcon: '🌿', sectionColor: '#2D7A50', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel happy?' },
  { id: 'q2',  section: 'Well-being', sectionIcon: '🌿', sectionColor: '#2D7A50', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel interested in life?' },
  { id: 'q3',  section: 'Well-being', sectionIcon: '🌿', sectionColor: '#2D7A50', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel satisfied with life?' },
  { id: 'q4',  section: 'Social',     sectionIcon: '🤝', sectionColor: '#5B6FA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that you had something important to contribute to society?' },
  { id: 'q5',  section: 'Social',     sectionIcon: '🤝', sectionColor: '#5B6FA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that you belonged to a community (like a social group, your neighborhood, your city)?' },
  { id: 'q6',  section: 'Social',     sectionIcon: '🤝', sectionColor: '#5B6FA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that our society is becoming a better place for all people?' },
  { id: 'q7',  section: 'Social',     sectionIcon: '🤝', sectionColor: '#5B6FA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that people are basically good?' },
  { id: 'q8',  section: 'Social',     sectionIcon: '🤝', sectionColor: '#5B6FA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that the way our society works makes sense to you?' },
  { id: 'q9',  section: 'Psychological', sectionIcon: '🧠', sectionColor: '#7B5EA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that you liked most parts of your personality?' },
  { id: 'q10', section: 'Psychological', sectionIcon: '🧠', sectionColor: '#7B5EA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel good at managing the responsibilities of your daily life?' },
  { id: 'q11', section: 'Psychological', sectionIcon: '🧠', sectionColor: '#7B5EA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that you had warm and trusting relationships with others?' },
  { id: 'q12', section: 'Psychological', sectionIcon: '🧠', sectionColor: '#7B5EA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that you had experiences that challenged you to grow and become a better person?' },
  { id: 'q13', section: 'Psychological', sectionIcon: '🧠', sectionColor: '#7B5EA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel confident to think or express your own ideas and opinions?' },
  { id: 'q14', section: 'Psychological', sectionIcon: '🧠', sectionColor: '#7B5EA0', source: 'MHC-SF', scale: 5, text: 'In the past month, how often did you feel that your life has a sense of direction or meaning to it?' },
  { id: 'q15', section: 'Mood & Interest', sectionIcon: '🌧', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?' },
  { id: 'q16', section: 'Mood & Interest', sectionIcon: '🌧', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?' },
  { id: 'q17', section: 'Sleep & Energy',  sectionIcon: '😴', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?' },
  { id: 'q18', section: 'Sleep & Energy',  sectionIcon: '😴', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?' },
  { id: 'q19', section: 'Appetite',        sectionIcon: '🥗', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?' },
  { id: 'q20', section: 'Self-Perception', sectionIcon: '💭', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself — or that you are a failure or have let yourself or your family down?' },
  { id: 'q21', section: 'Focus',          sectionIcon: '🎯', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading or watching TV?' },
  { id: 'q22', section: 'Psychomotor',    sectionIcon: '⚡', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly or being fidgety/restless?' },
  { id: 'q23', section: 'Safety',         sectionIcon: '🆘', sectionColor: '#C0392B', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead or of hurting yourself in some way?' },
  { id: 'q24', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?' },
  { id: 'q25', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?' },
  { id: 'q26', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?' },
  { id: 'q27', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by trouble relaxing?' },
  { id: 'q28', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by being so restless that it is hard to sit still?' },
  { id: 'q29', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?' },
  { id: 'q30', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?' }
]

export const OPTIONS_5 = [
  { value: 0, label: 'Never', emoji: '⚪' },
  { value: 1, label: 'Once or twice', emoji: '🌱' },
  { value: 2, label: 'About once a week', emoji: '🌿' },
  { value: 3, label: 'About 2 to 3 times a week', emoji: '🌳' },
  { value: 4, label: 'Almost every day', emoji: '⭐' },
  { value: 5, label: 'Every day', emoji: '✨' }
]

export const OPTIONS_3 = [
  { value: 0, label: 'Not at all', emoji: '😊' },
  { value: 1, label: 'Several days', emoji: '😐' },
  { value: 2, label: 'More than half the days', emoji: '😟' },
  { value: 3, label: 'Nearly every day', emoji: '😔' }
]

// ─── Therapist Directory ──────────────────────────────────────────────────────
export const THERAPISTS = [
  { id:1, name:'Dr. Priya Sharma',  specialty:'Anxiety & Depression',            qualification:'PhD Clinical Psychology, RCI Licensed', location:'Delhi (Online)',               rating:4.9, reviews:142, sessionFee:1200, languages:['Hindi','English'],         tags:['CBT','Mindfulness','MBSR'],             avatar:'PS', bookingUrl:'https://www.practo.com/delhi/therapist?q=Dr%20Priya%20Sharma',      bookingLabel:'Book on Practo' },
  { id:2, name:'Arjun Mehra',       specialty:'Stress & Burnout',                qualification:'M.Phil Psychology, RCI Licensed',       location:'Mumbai (Online)',              rating:4.8, reviews:98,  sessionFee:900,  languages:['English','Hindi','Marathi'], tags:['ACT','CBT','Career Stress'],            avatar:'AM', bookingUrl:'https://lissun.app',                                               bookingLabel:'Book on Lissun' },
  { id:3, name:'Dr. Kavitha Nair',  specialty:'Trauma & PTSD',                   qualification:'PhD Psychology, RCI Licensed',          location:'Bangalore (Online)',           rating:5.0, reviews:76,  sessionFee:1500, languages:['English','Kannada','Tamil'],  tags:['EMDR','Trauma','PTSD'],                 avatar:'KN', bookingUrl:'https://www.rockethealth.app',                                     bookingLabel:'Book on Rocket Health' },
  { id:4, name:'Sneha Iyer',        specialty:'Student & Academic Stress',       qualification:'MSc Counselling Psychology',            location:'Chennai (Online)',             rating:4.7, reviews:203, sessionFee:700,  languages:['English','Tamil'],            tags:['Student Wellness','Exam Stress','CBT'], avatar:'SI', bookingUrl:'https://thedostapp.com',                                           bookingLabel:'Book on Dost' },
]

// ─── Gamification & Streaks ───────────────────────────────────────────────────
export const BADGES = [
  { id:'first_checkin',  label:'First Step',    emoji:'🌱', desc:'Completed your first check-in',          condition:(h)=>h.length>=1 },
  { id:'week_streak',    label:'7-Day Warrior', emoji:'🔥', desc:'7 check-ins in a row',                   condition:(h)=>calcStreak(h)>=7 },
  { id:'month_streak',   label:'Month Master',  emoji:'💪', desc:'30 check-ins in a row',                  condition:(h)=>calcStreak(h)>=30 },
  { id:'ten_checkins',   label:'Dedicated',     emoji:'⭐', desc:'10 total check-ins completed',           condition:(h)=>h.length>=10 },
  { id:'fifty_checkins', label:'Committed',     emoji:'🏆', desc:'50 total check-ins completed',           condition:(h)=>h.length>=50 },
  { id:'improving',      label:'On the Rise',   emoji:'📈', desc:'Well-being improved 10+ pts in 7 days',  condition:(h)=>scoreImproved(h,7,10) },
  { id:'healthy_week',   label:'Thriving Week', emoji:'🌟', desc:'Scored 70+ Well-being for 7 days',       condition:(h)=>allAbove(h,7,70) },
]

export function calcStreak(history) {
  if (!history || history.length === 0) return 0
  const today     = new Date()
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1)
  const todayStr     = today.toLocaleDateString('en-CA')
  const yesterdayStr = yesterday.toLocaleDateString('en-CA')
  const historyDates = new Set(history.map(e => e.date?.substring(0,10)))
  if (!historyDates.has(todayStr) && !historyDates.has(yesterdayStr)) return 0
  let streak = 0
  const currentDate = new Date()
  if (!historyDates.has(todayStr) && historyDates.has(yesterdayStr)) currentDate.setDate(currentDate.getDate()-1)
  while (true) {
    const ds = currentDate.toLocaleDateString('en-CA')
    if (historyDates.has(ds)) { streak++; currentDate.setDate(currentDate.getDate()-1) }
    else break
  }
  return streak
}
// Updated to use the new y_score_norm instead of the old 1D score
function scoreImproved(h,days,amount){if(h.length<2)return false;const s=[...h].sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(-days);return s.length>=2&&s[s.length-1].y_score_norm-s[0].y_score_norm>=amount}
function allAbove(h,days,threshold){if(h.length<days)return false;return[...h].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,days).every(e=>e.y_score_norm>=threshold)}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
export function scoreColor(wellness) {
  if (wellness >= 85) return '#1B5E3B'
  if (wellness >= 67) return '#2471A3'
  if (wellness >= 50) return '#D4740A'
  if (wellness >= 33) return '#C0392B'
  return '#922B21'
}
