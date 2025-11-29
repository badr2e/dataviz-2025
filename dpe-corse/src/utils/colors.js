// Official DPE colors
export const DPE_COLORS = {
  A: '#319834',
  B: '#33CC31',
  C: '#CBFC34',
  D: '#FBFE06',
  E: '#FBCC04',
  F: '#F99D1C',
  G: '#E9262B',
};

// DPE colors with opacity for backgrounds
export const DPE_COLORS_LIGHT = {
  A: 'rgba(49, 152, 52, 0.15)',
  B: 'rgba(51, 204, 49, 0.15)',
  C: 'rgba(203, 252, 52, 0.15)',
  D: 'rgba(251, 254, 6, 0.15)',
  E: 'rgba(251, 204, 4, 0.15)',
  F: 'rgba(249, 157, 28, 0.15)',
  G: 'rgba(233, 38, 43, 0.15)',
};

// Text colors for DPE badges (for contrast)
export const DPE_TEXT_COLORS = {
  A: '#ffffff',
  B: '#1a1a1a',
  C: '#1a1a1a',
  D: '#1a1a1a',
  E: '#1a1a1a',
  F: '#1a1a1a',
  G: '#ffffff',
};

// DPE class descriptions
export const DPE_LABELS = {
  A: 'Excellent',
  B: 'Très bon',
  C: 'Bon',
  D: 'Moyen',
  E: 'Insuffisant',
  F: 'Très insuffisant',
  G: 'Passoire thermique',
};

// Consumption ranges (kWh/m²/an)
export const DPE_RANGES = {
  A: '≤ 70',
  B: '71-110',
  C: '111-180',
  D: '181-250',
  E: '251-330',
  F: '331-420',
  G: '> 420',
};

// GES ranges (kg CO2/m²/an)
export const GES_RANGES = {
  A: '≤ 6',
  B: '7-11',
  C: '12-30',
  D: '31-50',
  E: '51-70',
  F: '71-100',
  G: '> 100',
};

// Ordered DPE classes
export const DPE_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// Helper function to get color for a DPE class
export const getDPEColor = (dpeClass) => DPE_COLORS[dpeClass] || '#999999';

// Helper function to get text color for a DPE class
export const getDPETextColor = (dpeClass) => DPE_TEXT_COLORS[dpeClass] || '#ffffff';

// Generate gradient stops for charts
export const DPE_GRADIENT_STOPS = [
  { offset: '0%', color: DPE_COLORS.A },
  { offset: '16.67%', color: DPE_COLORS.B },
  { offset: '33.33%', color: DPE_COLORS.C },
  { offset: '50%', color: DPE_COLORS.D },
  { offset: '66.67%', color: DPE_COLORS.E },
  { offset: '83.33%', color: DPE_COLORS.F },
  { offset: '100%', color: DPE_COLORS.G },
];

// Performance score (A=7, G=1)
export const getDPEScore = (dpeClass) => {
  const scores = { A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1 };
  return scores[dpeClass] || 0;
};

// Get class from score
export const getClassFromScore = (score) => {
  if (score >= 6.5) return 'A';
  if (score >= 5.5) return 'B';
  if (score >= 4.5) return 'C';
  if (score >= 3.5) return 'D';
  if (score >= 2.5) return 'E';
  if (score >= 1.5) return 'F';
  return 'G';
};

// Color scale for map (based on average score)
export const getMapColor = (score) => {
  if (score >= 5.5) return DPE_COLORS.A;
  if (score >= 4.5) return DPE_COLORS.B;
  if (score >= 3.5) return DPE_COLORS.C;
  if (score >= 3.0) return DPE_COLORS.D;
  if (score >= 2.5) return DPE_COLORS.E;
  if (score >= 2.0) return DPE_COLORS.F;
  return DPE_COLORS.G;
};

// Passoire thermique threshold
export const isPassoireThermique = (dpeClass) => {
  return dpeClass === 'F' || dpeClass === 'G';
};
