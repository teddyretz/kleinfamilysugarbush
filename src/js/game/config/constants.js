export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;

// Tapping game
export const SAP_GOAL = 40;
export const TREE_COUNT = 5;
export const BUCKET_CAPACITY = 2;
export const DRIP_RATE_BASE = 0.1;
export const OVERFLOW_PENALTY = 0.5;

// Boiling game
export const SYRUP_TEMP = 219;
export const BOILING_POINT = 212;
export const BURN_TEMP = 235;
export const ROOM_TEMP = 60;
export const SYRUP_BRIX_MIN = 66;
export const SYRUP_BRIX_MAX = 67;
export const FIRE_DECAY_RATE = 3;
export const WOOD_HEAT_BOOST = 20;
export const MAX_WOOD = 8;
export const TEMP_RISE_RATE = 5;

// Grade thresholds (based on concentration percentage 0-100)
export const GRADES = [
  { name: 'Golden Delicate', minColor: 0, maxColor: 30, color: '#FFD700' },
  { name: 'Amber Rich', minColor: 30, maxColor: 55, color: '#FFBF00' },
  { name: 'Dark Robust', minColor: 55, maxColor: 80, color: '#CC7722' },
  { name: 'Very Dark Strong', minColor: 80, maxColor: 100, color: '#8B4513' },
];

// Colors for pixel art
export const COLORS = {
  snow: '#e8eaf0',
  sky: '#4a6fa5',
  treeTrunk: '#5c3d2e',
  treeLeaves: '#2d5a27',
  bucket: '#8a8a8a',
  bucketHighlight: '#aaaaaa',
  sap: '#d4a574',
  sapLight: '#f0d4a8',
  fire: ['#ff4500', '#ff6a00', '#ffa500'],
  evaporator: '#555555',
  wood: '#6b4226',
  steam: '#cccccc',
  sugarHouse: '#3a2a1a',
};
