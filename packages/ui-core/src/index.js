// Main component
export { default as BattleBornIntelligence } from './components/BattleBornIntelligence.jsx';

// Platform context
export { PlatformContext, usePlatform } from './hooks/usePlatform.js';

// Hooks
export { useW } from './hooks/useWindowWidth.js';
export { useData } from './hooks/useData.js';

// Engine
export { computeIRS, TRIGGER_CFG, GRADE_COLORS, STAGE_NORMS } from './engine/irs.js';
export { buildGraph } from './engine/graph-builder.js';
export { computeLayout } from './engine/graph-layout.js';
export { computeGraphMetrics } from './engine/graph-metrics.js';
export { fmt, stageLabel, STAGE_COLORS, getStageColors, getStageLabel, getStageList } from './engine/formatters.js';
export { computeScore, getTriggerConfig } from './engine/scoring.js';
export { computeForecast, computeRiskScore } from './engine/forecast.js';
export { degreeCentrality, pageRank, betweennessCentrality, detectCommunities,
  relationshipStrength, computeInfluence, topInfluencers, networkMetrics, egoNetwork } from './engine/connectivity.js';

// Styles
export { GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN, RED, BLUE, PURPLE, ORANGE } from './styles/tokens.js';
export { GP, NODE_CFG, REL_CFG, GSTAGE_C, getGStageColors } from './styles/graph-tokens.js';
export { css, fadeIn } from './styles/animations.js';

// Data validation
export { validateDataPackage } from './data/validate.js';

// Shared components
export { Stat } from './components/shared/Stat.jsx';
export { Grade } from './components/shared/Grade.jsx';
export { MBar } from './components/shared/MBar.jsx';
export { Spark } from './components/shared/Spark.jsx';
export { Counter } from './components/shared/Counter.jsx';
export { FirstUseHint, ScoreExplainer, NewBadge } from './components/shared/Onboarding.jsx';
export { Gantt } from './components/shared/Gantt.jsx';
