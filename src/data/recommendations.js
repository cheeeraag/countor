// ─── Tier definitions ────────────────────────────────────────────────────────
export const TIERS = {
  maintenance: {
    label: 'Healthy',
    range: '70–100',
    color: '#1B5E3B',
    bg: '#E8F5EE',
    borderColor: '#A8D5BC',
    emoji: '🌿',
    desc: "You're in a good place. Focus on maintaining your wellbeing.",
  },
  improvement: {
    label: 'Moderate',
    range: '50–69',
    color: '#E07B3A',
    bg: '#FEF3E9',
    borderColor: '#F5C9A0',
    emoji: '🌤',
    desc: 'Some areas could use attention. Light support can help a lot.',
  },
  initial_help: {
    label: 'Needs Care',
    range: '35–49',
    color: '#D4740A',
    bg: '#FFF3E0',
    borderColor: '#F5C580',
    emoji: '🌧',
    desc: 'You may benefit from talking to a counsellor.',
  },
  stage1: {
    label: 'Seek Help',
    range: '15–34',
    color: '#C0392B',
    bg: '#FDEDEC',
    borderColor: '#F1A9A0',
    emoji: '⛈',
    desc: 'Professional support is recommended for you right now.',
  },
  stage2: {
    label: 'Urgent Care',
    range: '0–14',
    color: '#922B21',
    bg: '#FADBD8',
    borderColor: '#E8A59C',
    emoji: '🆘',
    desc: 'Please reach out to a mental health professional today.',
    crisis: { name: 'iCall Helpline', contact: '9152987821', note: 'Confidential, Mon–Sat 9am–10pm' },
  },
}

// ─── Score → tier helper ─────────────────────────────────────────────────────
export function scoreToTier(score) {
  if (score >= 70) return 'maintenance'
  if (score >= 50) return 'improvement'
  if (score >= 35) return 'initial_help'
  if (score >= 15) return 'stage1'
  return 'stage2'
}

export function scoreColor(score) {
  return TIERS[scoreToTier(score)].color
}

// ─── Recommendations ─────────────────────────────────────────────────────────
export const RECOMMENDATIONS = {
  maintenance: {
    approach: 'Content & Self-Management',
    approachDesc: "You're doing well. These tools will help you stay consistent and thrive.",
    actions: [
      { icon: '🧘', title: 'Daily Mindfulness', desc: '10-minute guided session each morning.' },
      { icon: '📓', title: 'Gratitude Journalling', desc: 'Write 3 things you are grateful for before bed.' },
      { icon: '😴', title: 'Sleep Hygiene', desc: 'Consistent wake-up time, no screens 30 min before bed.' },
      { icon: '🏃', title: 'Regular Exercise', desc: 'At least 3 sessions per week — any movement counts.' },
      { icon: '👥', title: 'Social Plans', desc: 'Schedule regular check-ins with friends or family.' },
    ],
    companies: [
      { name: 'LEVEL', tag: 'Mindfulness', url: '#', type: 'Content, AI & self-help' },
      { name: 'Evolve', tag: 'Self-help', url: '#', type: 'Content, AI & self-help' },
      { name: 'Being', tag: 'Wellness', url: '#', type: 'Content, AI & self-help' },
      { name: 'Manah Wellness', tag: 'Content Platform', url: '#', type: 'Content, AI & self-help' },
    ],
  },
  improvement: {
    approach: 'Content & Light Support',
    approachDesc: 'A bit of structured support can make a meaningful difference right now.',
    actions: [
      { icon: '🧘', title: 'Guided Meditation', desc: 'Try a structured 21-day mindfulness programme.' },
      { icon: '💤', title: 'Sleep Improvement', desc: 'Address sleep hygiene and consider a sleep tracker.' },
      { icon: '✍️', title: 'Stress Journalling', desc: 'Write about what is stressing you and potential solutions.' },
      { icon: '🤝', title: 'Weekly Connection', desc: 'Prioritise at least one meaningful social interaction weekly.' },
      { icon: '📱', title: 'AI Wellness Support', desc: 'Use an app like Wysa for daily mood tracking and CBT tools.' },
    ],
    companies: [
      { name: 'Wysa', tag: 'AI Support', url: '#', type: 'Content, AI & self-help' },
      { name: 'Evolve', tag: 'Self-help', url: '#', type: 'Content, AI & self-help' },
      { name: 'Mindpeers', tag: 'AI Wellness', url: '#', type: 'Content, AI & self-help' },
      { name: 'Manah Wellness', tag: 'Platform', url: '#', type: 'Content, AI & self-help' },
    ],
  },
  initial_help: {
    approach: 'Therapy / Counselling',
    approachDesc: "Many people find counselling very helpful at this stage. You don't have to navigate this alone.",
    actions: [
      { icon: '🗣', title: 'Online Counselling', desc: 'Book a session with a certified counsellor via an app.' },
      { icon: '👥', title: 'Peer Support Groups', desc: 'Join community support groups — shared experiences help.' },
      { icon: '🌬', title: 'Anxiety Management', desc: 'Learn box breathing, grounding techniques, and STOP method.' },
      { icon: '🧠', title: 'MBSR Programme', desc: 'Mindfulness-Based Stress Reduction 8-week course.' },
      { icon: '🎯', title: 'Behavioural Activation', desc: 'Schedule small, pleasurable activities daily.' },
    ],
    companies: [
      { name: 'I Am Ears', tag: 'Peer Support', url: '#', type: 'Peer & group led' },
      { name: 'JumpingMinds', tag: 'Community', url: '#', type: 'Peer & group led' },
      { name: 'Wysa', tag: 'AI Therapy', url: '#', type: 'Content, AI & self-help' },
      { name: 'Lissun', tag: 'Therapist Led', url: '#', type: 'Therapist & expert led' },
      { name: 'Dost', tag: 'Counselling', url: '#', type: 'Therapist & expert led' },
    ],
  },
  stage1: {
    approach: 'Diagnosis + Early Intervention',
    approachDesc: 'Early professional support makes a big difference. Please reach out to a therapist or counsellor.',
    actions: [
      { icon: '🏥', title: 'Book a Therapy Session', desc: 'Start with a licensed therapist (RCI certified) soon.' },
      { icon: '💊', title: 'Psychiatrist Evaluation', desc: 'Consider a psychiatric evaluation if symptoms persist.' },
      { icon: '📋', title: 'Structured Daily Routine', desc: 'Regular schedules significantly reduce anxiety and depression.' },
      { icon: '👨‍👩‍👧', title: 'Support Network', desc: 'Involve trusted family or friends in your recovery journey.' },
      { icon: '🌙', title: 'Prioritise Rest', desc: 'Sleep 7-9 hours; rest is medicine for the mind.' },
    ],
    companies: [
      { name: 'Rocket Health', tag: 'Expert Therapy', url: '#', type: 'Therapist & expert led' },
      { name: 'That Mate', tag: 'Professional', url: '#', type: 'Therapist & expert led' },
      { name: 'Walnut', tag: 'Clinical', url: '#', type: 'Therapist & expert led' },
      { name: 'Mindpeers', tag: 'Expert Support', url: '#', type: 'Content, AI & self-help' },
      { name: 'MindOC', tag: 'Specialist', url: '#', type: 'Therapist & expert led' },
    ],
  },
  stage2: {
    approach: 'Immediate Diagnosis + Therapy',
    approachDesc: 'You deserve dedicated expert care. Reaching out is the bravest thing you can do.',
    actions: [
      { icon: '☎️', title: 'Call iCall Now', desc: '9152987821 — free, confidential, Mon–Sat 9am–10pm.' },
      { icon: '🏥', title: 'Psychiatrist Consultation', desc: 'Book an urgent appointment with a psychiatrist.' },
      { icon: '👨‍👩‍👧', title: 'Tell Someone You Trust', desc: 'Let a family member or close friend know you need support.' },
      { icon: '📋', title: 'Structured Treatment Plan', desc: 'Work with a professional on a personalised plan.' },
      { icon: '💊', title: 'Follow Medical Advice', desc: 'Take prescribed medication and attend all sessions.' },
    ],
    companies: [
      { name: 'Amaha', tag: 'Clinical Care', url: '#', type: 'Content, AI & self-help' },
      { name: 'Walnut', tag: 'Expert Care', url: '#', type: 'Therapist & expert led' },
      { name: 'KinderPass', tag: 'Specialist', url: '#', type: 'Therapist & expert led' },
      { name: 'Tactopus', tag: 'Support', url: '#', type: 'Therapist & expert led' },
    ],
  },
}

// ─── Therapist Directory ─────────────────────────────────────────────────────
export const THERAPISTS = [
  { id: 1, name: 'Dr. Priya Sharma', specialty: 'Anxiety & Depression', qualification: 'PhD Clinical Psychology, RCI Licensed', location: 'Delhi (Online)', rating: 4.9, reviews: 142, sessionFee: 1200, languages: ['Hindi', 'English'], tags: ['CBT', 'Mindfulness', 'MBSR'], avatar: 'PS', tier: ['initial_help', 'stage1', 'stage2'] },
  { id: 2, name: 'Arjun Mehra', specialty: 'Stress & Burnout', qualification: 'M.Phil Psychology, RCI Licensed', location: 'Mumbai (Online)', rating: 4.8, reviews: 98, sessionFee: 900, languages: ['English', 'Hindi', 'Marathi'], tags: ['ACT', 'CBT', 'Career Stress'], avatar: 'AM', tier: ['improvement', 'initial_help', 'stage1'] },
  { id: 3, name: 'Dr. Kavitha Nair', specialty: 'Trauma & PTSD', qualification: 'PhD Psychology, RCI Licensed', location: 'Bangalore (Online)', rating: 5.0, reviews: 76, sessionFee: 1500, languages: ['English', 'Kannada', 'Tamil'], tags: ['EMDR', 'Trauma', 'PTSD'], avatar: 'KN', tier: ['stage1', 'stage2'] },
  { id: 4, name: 'Sneha Iyer', specialty: 'Student & Academic Stress', qualification: 'MSc Counselling Psychology', location: 'Chennai (Online)', rating: 4.7, reviews: 203, sessionFee: 700, languages: ['English', 'Tamil'], tags: ['Student Wellness', 'Exam Stress', 'CBT'], avatar: 'SI', tier: ['improvement', 'initial_help'] },
  { id: 5, name: 'Rahul Bose', specialty: 'Depression & Mood Disorders', qualification: 'M.Phil Clinical Psychology, RCI Licensed', location: 'Kolkata (Online)', rating: 4.8, reviews: 115, sessionFee: 1000, languages: ['English', 'Bengali', 'Hindi'], tags: ['Depression', 'DBT', 'Mood Disorders'], avatar: 'RB', tier: ['stage1', 'stage2'] },
  { id: 6, name: 'Anika Kapoor', specialty: 'Relationship & Life Transitions', qualification: 'MSc Psychology, Certified Coach', location: 'Pune (Online)', rating: 4.6, reviews: 89, sessionFee: 800, languages: ['Hindi', 'English', 'Marathi'], tags: ['Relationships', 'Coaching', 'Life Transitions'], avatar: 'AK', tier: ['maintenance', 'improvement'] },
  { id: 7, name: 'Dr. Sanjay Kumar', specialty: 'Addiction & Recovery', qualification: 'MD Psychiatry', location: 'Hyderabad (Online + In-person)', rating: 4.9, reviews: 61, sessionFee: 2000, languages: ['English', 'Telugu', 'Hindi'], tags: ['Addiction', 'Psychiatry', 'Schizophrenia'], avatar: 'SK', tier: ['stage2'] },
  { id: 8, name: 'Meera Pillai', specialty: 'Mindfulness & Wellness', qualification: 'MSc Clinical Psychology', location: 'Kerala (Online)', rating: 4.7, reviews: 177, sessionFee: 650, languages: ['Malayalam', 'English'], tags: ['Mindfulness', 'Wellness', 'MBSR'], avatar: 'MP', tier: ['maintenance', 'improvement', 'initial_help'] },
]

// ─── Gamification ────────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first_checkin', label: 'First Step', emoji: '🌱', desc: 'Completed your first check-in', condition: (h) => h.length >= 1 },
  { id: 'week_streak', label: '7-Day Warrior', emoji: '🔥', desc: '7 days in a row', condition: (h) => calcStreak(h) >= 7 },
  { id: 'month_streak', label: 'Month Master', emoji: '💪', desc: '30 days in a row', condition: (h) => calcStreak(h) >= 30 },
  { id: 'ten_checkins', label: 'Dedicated', emoji: '⭐', desc: '10 total check-ins', condition: (h) => h.length >= 10 },
  { id: 'fifty_checkins', label: 'Committed', emoji: '🏆', desc: '50 total check-ins', condition: (h) => h.length >= 50 },
  { id: 'improving', label: 'On the Rise', emoji: '📈', desc: 'Score improved 10+ points over 7 days', condition: (h) => scoreImproved(h, 7, 10) },
  { id: 'healthy_week', label: 'Thriving Week', emoji: '🌟', desc: 'Scored 70+ every day for 7 days', condition: (h) => allAbove(h, 7, 70) },
  { id: 'consistent', label: 'Consistent', emoji: '🎯', desc: '14 days without missing a check-in', condition: (h) => calcStreak(h) >= 14 },
]

export function calcStreak(history) {
  if (!history.length) return 0
  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))
  let streak = 0
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date()
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]
    if (sorted[i].date === expectedStr) streak++
    else break
  }
  return streak
}

function scoreImproved(history, days, amount) {
  if (history.length < 2) return false
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))
  const recent = sorted.slice(-days)
  if (recent.length < 2) return false
  return recent[recent.length - 1].score - recent[0].score >= amount
}

function allAbove(history, days, threshold) {
  if (history.length < days) return false
  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))
  return sorted.slice(0, days).every(h => h.score >= threshold)
}
