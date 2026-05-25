// ─── PHQ-9 + GAD-7 Derived Questions ─────────────────────────────────────────
export const QUESTIONS = [
  { id:'phq1', section:'Mood & Interest',  sectionColor:'#2D7A50', sectionIcon:'🌿', source:'PHQ-9', text:'Over the past 2 weeks, how often have you had little interest or pleasure in doing things?' },
  { id:'phq2', section:'Mood & Interest',  sectionColor:'#2D7A50', sectionIcon:'🌿', source:'PHQ-9', text:'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?' },
  { id:'phq3', section:'Sleep & Energy',   sectionColor:'#5B6FA0', sectionIcon:'😴', source:'PHQ-9', text:'Over the past 2 weeks, how often have you had trouble falling or staying asleep, or slept too much?' },
  { id:'phq4', section:'Sleep & Energy',   sectionColor:'#5B6FA0', sectionIcon:'😴', source:'PHQ-9', text:'Over the past 2 weeks, how often have you felt tired or had little energy?' },
  { id:'phq5', section:'Concentration',    sectionColor:'#7B5EA0', sectionIcon:'🧠', source:'PHQ-9', text:'Over the past 2 weeks, how often have you had trouble concentrating on things, such as reading, studying, or watching TV?' },
  { id:'phq6', section:'Concentration',    sectionColor:'#7B5EA0', sectionIcon:'🧠', source:'PHQ-9', text:'Over the past 2 weeks, how often have you felt bad about yourself, or that you are a failure or have let yourself or your family down?' },
  { id:'gad1', section:'Anxiety',          sectionColor:'#A06030', sectionIcon:'💭', source:'GAD-7', text:'Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?' },
  { id:'gad2', section:'Anxiety',          sectionColor:'#A06030', sectionIcon:'💭', source:'GAD-7', text:'Over the past 2 weeks, how often have you not been able to stop or control worrying?' },
  { id:'gad3', section:'Anxiety',          sectionColor:'#A06030', sectionIcon:'💭', source:'GAD-7', text:'Over the past 2 weeks, how often have you become easily annoyed or irritable?' },
  { id:'gad4', section:'Anxiety',          sectionColor:'#A06030', sectionIcon:'💭', source:'GAD-7', text:'Over the past 2 weeks, how often have you felt afraid, as if something awful might happen?' },
]

export const OPTIONS = [
  { value:0, label:'Not at all',             emoji:'😊' },
  { value:1, label:'Several days',           emoji:'😐' },
  { value:2, label:'More than half the days', emoji:'😟' },
  { value:3, label:'Nearly every day',       emoji:'😔' },
]

export function calculateScore(answers) {
  const raw        = Object.values(answers).reduce((sum, v) => sum + v, 0)
  const wellness   = Math.round(((30 - raw) / 30) * 100)
  const tier       = rawToTier(raw)
  const depression = ['phq1','phq2','phq3','phq4','phq5','phq6'].reduce((s, k) => s + (answers[k] ?? 0), 0)
  const anxiety    = ['gad1','gad2','gad3','gad4'].reduce((s, k) => s + (answers[k] ?? 0), 0)
  return { wellness, raw, tier, depression, anxiety }
}

function rawToTier(raw) {
  if (raw <= 4)  return 'maintenance'
  if (raw <= 9)  return 'improvement'
  if (raw <= 14) return 'initial_help'
  if (raw <= 19) return 'stage1'
  return 'stage2'
}

export const TIERS = {
  maintenance: { label:'Healthy',            range:'0–4',   color:'#1B5E3B', bg:'#E8F5EE', borderColor:'#A8D5BC', emoji:'🌿', desc:"You're doing great. These are minimal or no symptoms." },
  improvement: { label:'Mild',               range:'5–9',   color:'#2471A3', bg:'#EBF5FB', borderColor:'#9DD3F4', emoji:'🌤', desc:'Mild symptoms present. Self-care and monitoring recommended.' },
  initial_help:{ label:'Moderate',           range:'10–14', color:'#D4740A', bg:'#FFF3E0', borderColor:'#F5C580', emoji:'🌧', desc:'Moderate symptoms. Speaking to a counsellor is advised.' },
  stage1:      { label:'Moderately Severe',  range:'15–19', color:'#C0392B', bg:'#FDEDEC', borderColor:'#F1A9A0', emoji:'⛈', desc:'Significant symptoms. Professional support is recommended.' },
  stage2:      { label:'Severe',             range:'20–30', color:'#922B21', bg:'#FADBD8', borderColor:'#E8A59C', emoji:'🆘', desc:'Severe symptoms. Please reach out to a mental health professional today.', crisis:{ name:'iCall Helpline', contact:'9152987821', note:'Free & confidential, Mon–Sat 9am–10pm' } },
}

export function scoreColor(wellness) {
  if (wellness >= 85) return '#1B5E3B'
  if (wellness >= 67) return '#2471A3'
  if (wellness >= 50) return '#D4740A'
  if (wellness >= 33) return '#C0392B'
  return '#922B21'
}

// ─── Company / Partner Data ───────────────────────────────────────────────────
// url:          The partner's landing/signup page
// affiliateUrl: Add your affiliate/referral code here once you have a deal.
//               Until then, UTM params are appended automatically by the backend.
// ctaLabel:     Button text shown to the user
// description:  One-line value prop shown on the card

export const COMPANIES = {
  level:          { id:'level',          name:'LEVEL',           tag:'Mindfulness App',     url:'https://www.getlevel.app',                affiliateUrl: null, ctaLabel:'Try LEVEL Free',      description:'Guided mindfulness, meditation, and focus sessions.' },
  evolve:         { id:'evolve',         name:'Evolve',          tag:'Self-help App',       url:'https://evolveapp.in',                    affiliateUrl: null, ctaLabel:'Start with Evolve',   description:'Daily self-improvement habits for mental wellness.' },
  being:          { id:'being',          name:'Being',           tag:'Wellness App',        url:'https://being.club',                      affiliateUrl: null, ctaLabel:'Join Being',          description:'Wellness community and guided self-care routines.' },
  manah:          { id:'manah',          name:'Manah Wellness',  tag:'Corporate Wellness',  url:'https://www.manaah.com',                  affiliateUrl: null, ctaLabel:'Explore Manah',       description:'Workplace mental health programmes for teams.' },
  wysa:           { id:'wysa',           name:'Wysa',            tag:'AI Therapy',          url:'https://www.wysa.io/signup',              affiliateUrl: 'https://www.wysa.io/signup?referral=COUNTOR', ctaLabel:'Try Wysa Free',       description:'Evidence-based AI chatbot for stress, anxiety, and low mood.' },
  mindpeers:      { id:'mindpeers',      name:'Mindpeers',       tag:'AI & Expert Support', url:'https://mindpeers.co',                    affiliateUrl: null, ctaLabel:'Explore Mindpeers',   description:'AI-driven emotional wellness with human expert support.' },
  iamears:        { id:'iamears',        name:'I Am Ears',       tag:'Peer Support',        url:'https://iamears.in',                      affiliateUrl: null, ctaLabel:'Find a Listener',     description:'Trained peer listeners available 24/7 for support.' },
  jumpingminds:   { id:'jumpingminds',   name:'JumpingMinds',    tag:'Peer Community',      url:'https://jumpingminds.ai',                 affiliateUrl: null, ctaLabel:'Join Community',      description:'Safe community and AI support for mental wellbeing.' },
  lissun:         { id:'lissun',         name:'Lissun',          tag:'Therapist-Led',       url:'https://lissun.app',                      affiliateUrl: null, ctaLabel:'Book a Session',      description:'Certified therapists and psychiatrists, online.' },
  dost:           { id:'dost',           name:'Dost',            tag:'Counselling',         url:'https://thedostapp.com',                  affiliateUrl: null, ctaLabel:'Talk to a Dost',      description:'Affordable online counselling with verified therapists.' },
  rockethealth:   { id:'rockethealth',   name:'Rocket Health',   tag:'Expert Therapy',      url:'https://www.rockethealth.app',            affiliateUrl: null, ctaLabel:'Book a Session',      description:'Therapy and psychiatry — first session within 48 hours.' },
  thatmate:       { id:'thatmate',       name:'That Mate',       tag:'Professional Support', url:'https://thatmate.in',                    affiliateUrl: null, ctaLabel:'Meet Your Mate',      description:'Mental health support from certified professionals.' },
  walnut:         { id:'walnut',         name:'Walnut',          tag:'Clinical Platform',   url:'https://walnutmentalhealth.com',          affiliateUrl: null, ctaLabel:'Get Started',         description:'Specialised clinical care for complex mental health.' },
  amaha:          { id:'amaha',          name:'Amaha',           tag:'Clinical Care',       url:'https://www.amahahealth.com',             affiliateUrl: null, ctaLabel:'Start Your Journey',  description:'Integrated therapy, psychiatry, and self-care plans.' },
  kinderpass:     { id:'kinderpass',     name:'KinderPass',      tag:'Child & Teen Care',   url:'https://kinderpass.com',                  affiliateUrl: null, ctaLabel:'Learn More',          description:'Specialised support for children and adolescents.' },
  tactopus:       { id:'tactopus',       name:'Tactopus',        tag:'Neurodiversity',      url:'https://tactopus.com',                    affiliateUrl: null, ctaLabel:'Explore Tactopus',    description:'Support for neurodiverse children and families.' },
}

// ─── Recommendations by Tier ──────────────────────────────────────────────────
export const RECOMMENDATIONS = {
  maintenance: {
    approach: 'Content & Self-Management',
    approachDesc: "You're in a good place. These habits will keep you thriving.",
    actions: [
      { icon:'🧘', title:'Daily Mindfulness',     desc:'10-minute guided session each morning.' },
      { icon:'📓', title:'Gratitude Journalling',  desc:'Write 3 things you are grateful for before bed.' },
      { icon:'😴', title:'Sleep Hygiene',          desc:'Consistent wake-up time, no screens 30 min before bed.' },
      { icon:'🏃', title:'Regular Exercise',       desc:'At least 3 sessions per week — any movement counts.' },
      { icon:'👥', title:'Stay Social',            desc:'Regular check-ins with friends or family boost wellbeing.' },
    ],
    companies: ['level','evolve','being','manah'],
  },
  improvement: {
    approach: 'Guided Self-Help',
    approachDesc: 'Mild symptoms are common. Structured support can make a meaningful difference.',
    actions: [
      { icon:'🧘', title:'Guided Meditation',   desc:'Try a structured 21-day mindfulness programme.' },
      { icon:'💤', title:'Sleep Improvement',   desc:'Address sleep hygiene and consider a sleep tracker.' },
      { icon:'✍️', title:'Mood Journalling',    desc:'Track triggers and patterns in a daily mood journal.' },
      { icon:'🤝', title:'Stay Connected',      desc:'Prioritise at least one meaningful social interaction weekly.' },
      { icon:'📵', title:'Digital Boundaries',  desc:'Reduce doom-scrolling — set app time limits.' },
    ],
    companies: ['wysa','evolve','mindpeers','manah'],
  },
  initial_help: {
    approach: 'Therapy / Counselling',
    approachDesc: "Many people find counselling very helpful at this stage. You don't have to navigate this alone.",
    actions: [
      { icon:'🗣',  title:'Online Counselling',       desc:'Book a session with a certified counsellor via an app.' },
      { icon:'👥',  title:'Peer Support Groups',      desc:'Join community support groups — shared experiences help.' },
      { icon:'🌬',  title:'Anxiety Management',       desc:'Learn box breathing, grounding techniques, and CBT basics.' },
      { icon:'🧠',  title:'MBSR Programme',           desc:'Mindfulness-Based Stress Reduction 8-week course.' },
      { icon:'🎯',  title:'Behavioural Activation',  desc:'Schedule small, pleasurable activities daily.' },
    ],
    companies: ['iamears','jumpingminds','wysa','lissun','dost'],
  },
  stage1: {
    approach: 'Professional Therapy',
    approachDesc: 'Please reach out to a therapist soon. Early professional support makes a significant difference.',
    actions: [
      { icon:'🏥',      title:'Book a Therapy Session',     desc:'Start with a licensed therapist (RCI certified) soon.' },
      { icon:'💊',      title:'Psychiatrist Evaluation',    desc:'Consider a psychiatric evaluation if symptoms persist.' },
      { icon:'📋',      title:'Structured Daily Routine',   desc:'Regular schedules significantly reduce anxiety and depression.' },
      { icon:'👨‍👩‍👧', title:'Build Your Support Network',  desc:'Involve trusted family or friends in your recovery.' },
      { icon:'🌙',      title:'Prioritise Rest',            desc:'Sleep 7–9 hours; rest is essential medicine for the mind.' },
    ],
    companies: ['rockethealth','thatmate','walnut','mindpeers'],
  },
  stage2: {
    approach: 'Immediate Professional Care',
    approachDesc: 'You deserve dedicated expert care. Reaching out is the bravest and most important step.',
    actions: [
      { icon:'☎️',      title:'Call iCall Now',             desc:'9152987821 — free, confidential, Mon–Sat 9am–10pm.' },
      { icon:'🏥',      title:'Psychiatrist Consultation', desc:'Book an urgent appointment with a psychiatrist.' },
      { icon:'👨‍👩‍👧', title:'Tell Someone You Trust',    desc:'Let a family member or close friend know you need support.' },
      { icon:'📋',      title:'Treatment Plan',            desc:'Work with a professional on a personalised care plan.' },
      { icon:'💊',      title:'Follow Medical Advice',     desc:'Take prescribed medication and attend all sessions.' },
    ],
    companies: ['amaha','walnut','kinderpass','tactopus'],
  },
}

// ─── Therapist Directory ──────────────────────────────────────────────────────
// bookingUrl:    Direct link to their platform or search
// bookingLabel:  Button text
export const THERAPISTS = [
  { id:1, name:'Dr. Priya Sharma',  specialty:'Anxiety & Depression',            qualification:'PhD Clinical Psychology, RCI Licensed', location:'Delhi (Online)',               rating:4.9, reviews:142, sessionFee:1200, languages:['Hindi','English'],         tags:['CBT','Mindfulness','MBSR'],             avatar:'PS', bookingUrl:'https://www.practo.com/delhi/therapist?q=Dr%20Priya%20Sharma',      bookingLabel:'Book on Practo' },
  { id:2, name:'Arjun Mehra',       specialty:'Stress & Burnout',                qualification:'M.Phil Psychology, RCI Licensed',       location:'Mumbai (Online)',              rating:4.8, reviews:98,  sessionFee:900,  languages:['English','Hindi','Marathi'], tags:['ACT','CBT','Career Stress'],            avatar:'AM', bookingUrl:'https://lissun.app',                                               bookingLabel:'Book on Lissun' },
  { id:3, name:'Dr. Kavitha Nair',  specialty:'Trauma & PTSD',                   qualification:'PhD Psychology, RCI Licensed',          location:'Bangalore (Online)',           rating:5.0, reviews:76,  sessionFee:1500, languages:['English','Kannada','Tamil'],  tags:['EMDR','Trauma','PTSD'],                 avatar:'KN', bookingUrl:'https://www.rockethealth.app',                                     bookingLabel:'Book on Rocket Health' },
  { id:4, name:'Sneha Iyer',        specialty:'Student & Academic Stress',       qualification:'MSc Counselling Psychology',            location:'Chennai (Online)',             rating:4.7, reviews:203, sessionFee:700,  languages:['English','Tamil'],            tags:['Student Wellness','Exam Stress','CBT'], avatar:'SI', bookingUrl:'https://thedostapp.com',                                           bookingLabel:'Book on Dost' },
  { id:5, name:'Rahul Bose',        specialty:'Depression & Mood Disorders',     qualification:'M.Phil Clinical Psychology, RCI',       location:'Kolkata (Online)',             rating:4.8, reviews:115, sessionFee:1000, languages:['English','Bengali','Hindi'],  tags:['Depression','DBT','Mood Disorders'],    avatar:'RB', bookingUrl:'https://www.amahahealth.com',                                      bookingLabel:'Book on Amaha' },
  { id:6, name:'Anika Kapoor',      specialty:'Relationships & Life Transitions',qualification:'MSc Psychology, Certified Coach',       location:'Pune (Online)',                rating:4.6, reviews:89,  sessionFee:800,  languages:['Hindi','English','Marathi'],  tags:['Relationships','Coaching'],             avatar:'AK', bookingUrl:'https://thatmate.in',                                              bookingLabel:'Book on That Mate' },
  { id:7, name:'Dr. Sanjay Kumar',  specialty:'Addiction & Recovery',            qualification:'MD Psychiatry',                         location:'Hyderabad (Online+In-person)', rating:4.9, reviews:61,  sessionFee:2000, languages:['English','Telugu','Hindi'],   tags:['Addiction','Psychiatry'],               avatar:'SK', bookingUrl:'https://walnutmentalhealth.com',                                   bookingLabel:'Book on Walnut' },
  { id:8, name:'Meera Pillai',      specialty:'Mindfulness & Wellness',          qualification:'MSc Clinical Psychology',               location:'Kerala (Online)',              rating:4.7, reviews:177, sessionFee:650,  languages:['Malayalam','English'],        tags:['Mindfulness','Wellness','MBSR'],        avatar:'MP', bookingUrl:'https://lissun.app',                                               bookingLabel:'Book on Lissun' },
]

// ─── Gamification ─────────────────────────────────────────────────────────────
export const BADGES = [
  { id:'first_checkin',  label:'First Step',    emoji:'🌱', desc:'Completed your first check-in',          condition:(h)=>h.length>=1 },
  { id:'week_streak',    label:'7-Day Warrior', emoji:'🔥', desc:'7 check-ins in a row',                   condition:(h)=>calcStreak(h)>=7 },
  { id:'month_streak',   label:'Month Master',  emoji:'💪', desc:'30 check-ins in a row',                  condition:(h)=>calcStreak(h)>=30 },
  { id:'ten_checkins',   label:'Dedicated',     emoji:'⭐', desc:'10 total check-ins completed',           condition:(h)=>h.length>=10 },
  { id:'fifty_checkins', label:'Committed',     emoji:'🏆', desc:'50 total check-ins completed',           condition:(h)=>h.length>=50 },
  { id:'improving',      label:'On the Rise',   emoji:'📈', desc:'Score improved 10+ points over 7 days', condition:(h)=>scoreImproved(h,7,10) },
  { id:'healthy_week',   label:'Thriving Week', emoji:'🌟', desc:'Scored 70+ every day for 7 days',        condition:(h)=>allAbove(h,7,70) },
  { id:'consistent',     label:'Consistent',    emoji:'🎯', desc:'14 days without missing a check-in',    condition:(h)=>calcStreak(h)>=14 },
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

function scoreImproved(h,days,amount){if(h.length<2)return false;const s=[...h].sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(-days);return s.length>=2&&s[s.length-1].score-s[0].score>=amount}
function allAbove(h,days,threshold){if(h.length<days)return false;return[...h].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,days).every(e=>e.score>=threshold)}
