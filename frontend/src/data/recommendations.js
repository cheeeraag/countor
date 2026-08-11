// ─── The 30 Assessment Questions (14 MHC-SF + 16 PHQ-ADS) ─────────────────────
export const QUESTIONS = [
  // MHC-SF (Y-Axis: Mental Well-being | Scale 0-5)
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

  // PHQ-9 (X-Axis Component: Depression | Scale 0-3)
  { id: 'q15', section: 'Mood & Interest', sectionIcon: '🌧', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?' },
  { id: 'q16', section: 'Mood & Interest', sectionIcon: '🌧', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?' },
  { id: 'q17', section: 'Sleep & Energy',  sectionIcon: '😴', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?' },
  { id: 'q18', section: 'Sleep & Energy',  sectionIcon: '😴', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?' },
  { id: 'q19', section: 'Appetite',        sectionIcon: '🥗', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?' },
  { id: 'q20', section: 'Self-Perception', sectionIcon: '💭', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself — or that you are a failure or have let yourself or your family down?' },
  { id: 'q21', section: 'Focus',          sectionIcon: '🎯', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading or watching TV?' },
  { id: 'q22', section: 'Psychomotor',    sectionIcon: '⚡', sectionColor: '#A06030', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly or being fidgety/restless?' },
  { id: 'q23', section: 'Safety',         sectionIcon: '🆘', sectionColor: '#C0392B', source: 'PHQ-9', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead or of hurting yourself in some way?' },

  // GAD-7 (X-Axis Component: Anxiety | Scale 0-3)
  { id: 'q24', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?' },
  { id: 'q25', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?' },
  { id: 'q26', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?' },
  { id: 'q27', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by trouble relaxing?' },
  { id: 'q28', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by being so restless that it is hard to sit still?' },
  { id: 'q29', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?' },
  { id: 'q30', section: 'Anxiety',        sectionIcon: '🌪', sectionColor: '#C0392B', source: 'GAD-7', scale: 3, text: 'Over the last 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?' }
];

export const OPTIONS_5 = [
  { value: 0, label: 'Never', emoji: '⚪' },
  { value: 1, label: 'Once or twice', emoji: '🌱' },
  { value: 2, label: 'About once a week', emoji: '🌿' },
  { value: 3, label: 'About 2 to 3 times a week', emoji: '🌳' },
  { value: 4, label: 'Almost every day', emoji: '⭐' },
  { value: 5, label: 'Every day', emoji: '✨' }
];

export const OPTIONS_3 = [
  { value: 0, label: 'Not at all', emoji: '😊' },
  { value: 1, label: 'Several days', emoji: '😐' },
  { value: 2, label: 'More than half the days', emoji: '😟' },
  { value: 3, label: 'Nearly every day', emoji: '😔' }
];
