export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;

// Tapping game
export const SAP_GOAL = 40;
export const TREE_COUNT = 5;
export const BUCKET_CAPACITY = 2;
export const DRIP_RATE_BASE = 0.1;
export const OVERFLOW_PENALTY = 0.5;

// Freeze/thaw weather cycle (tapping game)
export const DAY_DURATION = 14;
export const NIGHT_DURATION = 8;
export const DAY_DRIP_MULT = 1.5;
export const NIGHT_DRIP_MULT = 0.35;

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
// Pan temperature approaches the fire's target temp proportionally
// (fraction of the gap per second), which smooths out stoking cycles
export const TEMP_APPROACH_RATE = 0.06;
export const TEMP_COOL_FACTOR = 1.3;
export const UNCUT_LOGS_START = 6;
export const LOG_DELIVERY_INTERVAL = 7;
export const LOG_FALL_TIMEOUT = 3.0;
export const LOG_WOBBLE_WARNING = 2.0;
export const AXE_CYCLE_DURATION = 1400;

// Density model: a hotter boil concentrates the batch faster, and the
// rise slows as it nears the syrup point so the draw-off window stays
// open for several seconds. Overshooting is recoverable with ADD SAP.
export const BRIX_RISE_COEFF = 0.5;
export const BRIX_SOFT_CEIL = 70;
export const BRIX_MAX = 75;
export const BRIX_FALL_RATE = 1.0;
export const DRAW_BRIX_MAX = 68.5;
export const DRAW_TEMP_MIN = 216;
export const DRAW_TEMP_MAX = 226;
export const SAP_ADD_DILUTION = 10;
export const SAP_ADD_COOLING = 10;
export const DARKNESS_RATE = 0.8;

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
