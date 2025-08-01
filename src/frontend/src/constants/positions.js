import { 
  Zap,      // QB
  Users,    // RB  
  Target,   // WR
  Shield,   // TE
  Crosshair, // K
  Layers,   // FLEX
  LayoutGrid, // ALL
  ShieldCheck, // DST
  Shuffle,  // SUPER_FLEX
  Repeat    // REC_FLEX
} from 'lucide-react';

// Position color constants - single source of truth
export const POSITION_COLORS = {
  QB: {
    name: 'Quarterbacks',
    color: 'red',
    icon: Zap,
    badgeClass: 'position-qb',
    borderClass: 'border-red-300 hover:border-red-400 hover:bg-red-50',
    textClass: 'text-red-800',
    bgClass: 'bg-red-100'
  },
  RB: {
    name: 'Running Backs',
    color: 'green',
    icon: Users,
    badgeClass: 'position-rb',
    borderClass: 'border-green-300 hover:border-green-400 hover:bg-green-50',
    textClass: 'text-green-800',
    bgClass: 'bg-green-100'
  },
  WR: {
    name: 'Wide Receivers',
    color: 'blue',
    icon: Target,
    badgeClass: 'position-wr',
    borderClass: 'border-blue-300 hover:border-blue-400 hover:bg-blue-50',
    textClass: 'text-blue-800',
    bgClass: 'bg-blue-100'
  },
  TE: {
    name: 'Tight Ends',
    color: 'yellow',
    icon: Shield,
    badgeClass: 'position-te',
    borderClass: 'border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50',
    textClass: 'text-yellow-800',
    bgClass: 'bg-yellow-100'
  },
  K: {
    name: 'Kickers',
    color: 'purple',
    icon: Crosshair,
    badgeClass: 'position-k',
    borderClass: 'border-purple-300 hover:border-purple-400 hover:bg-purple-50',
    textClass: 'text-purple-800',
    bgClass: 'bg-purple-100'
  },
  DEF: {
    name: 'Defense',
    color: 'gray',
    icon: Shield,
    badgeClass: 'position-def',
    borderClass: 'border-gray-400 hover:border-gray-500 hover:bg-gray-50',
    textClass: 'text-gray-800',
    bgClass: 'bg-gray-100'
  },
  DST: {
    name: 'Defense/Special Teams',
    color: 'slate',
    icon: ShieldCheck,
    badgeClass: 'position-dst',
    borderClass: 'border-slate-400 hover:border-slate-500 hover:bg-slate-50',
    textClass: 'text-slate-800',
    bgClass: 'bg-slate-100'
  },
  FLEX: {
    name: 'Flex Options (RB/WR/TE)',
    color: 'purple',
    icon: Layers,
    badgeClass: 'bg-purple-100 text-purple-800',
    borderClass: 'border-purple-300 hover:border-purple-400 hover:bg-purple-50',
    textClass: 'text-purple-800',
    bgClass: 'bg-purple-100'
  },
  SUPER_FLEX: {
    name: 'Super Flex (QB/RB/WR/TE)',
    color: 'indigo',
    icon: Shuffle,
    badgeClass: 'bg-indigo-100 text-indigo-800',
    borderClass: 'border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50',
    textClass: 'text-indigo-800',
    bgClass: 'bg-indigo-100'
  },
  REC_FLEX: {
    name: 'Receiver Flex (WR/TE)',
    color: 'cyan',
    icon: Repeat,
    badgeClass: 'bg-cyan-100 text-cyan-800',
    borderClass: 'border-cyan-300 hover:border-cyan-400 hover:bg-cyan-50',
    textClass: 'text-cyan-800',
    bgClass: 'bg-cyan-100'
  },
  ALL: {
    name: 'Best Available (All Positions)',
    color: 'gray',
    icon: LayoutGrid,
    badgeClass: 'bg-gray-100 text-gray-800',
    borderClass: 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
    textClass: 'text-gray-800',
    bgClass: 'bg-gray-100'
  }
};

// Helper functions
export const getPositionConfig = (position) => {
  return POSITION_COLORS[position] || POSITION_COLORS.DEF;
};

export const getPositionColor = (position) => {
  return getPositionConfig(position).color;
};

export const getPositionBadgeClass = (position) => {
  return getPositionConfig(position).badgeClass;
};

export const getPositionBorderClass = (position) => {
  return getPositionConfig(position).borderClass;
};

export const getPositionIcon = (position) => {
  return getPositionConfig(position).icon;
};

export const getPositionName = (position) => {
  return getPositionConfig(position).name;
};
