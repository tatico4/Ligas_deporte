// ─── Design Tokens — Canchero ─────────────────────────────────────────────────

export const colors = {
  primary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    900: "#14532d",
  },
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
  },
  status: {
    active:      { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
    draft:       { bg: "#f4f4f5", text: "#52525b", dot: "#a1a1aa" },
    registration:{ bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
    finished:    { bg: "#f4f4f5", text: "#71717a", dot: "#a1a1aa" },
    cancelled:   { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
    in_progress: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
    scheduled:   { bg: "#f4f4f5", text: "#52525b", dot: "#a1a1aa" },
    postponed:   { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  },
  medal: {
    gold:   "#f59e0b",
    silver: "#94a3b8",
    bronze: "#c2855a",
  },
};

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  green: {
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const TOURNAMENT_TYPE_META = {
  league:          { label: "Liga",              icon: "trophy-outline",   color: "#16a34a" },
  cup:             { label: "Copa",              icon: "ribbon-outline",   color: "#f59e0b" },
  group_knockout:  { label: "Grupos + Playoff",  icon: "git-network-outline", color: "#8b5cf6" },
} as const;

export const STATUS_META = {
  draft:        { label: "Borrador",    ...colors.status.draft },
  registration: { label: "Inscripción", ...colors.status.registration },
  active:       { label: "En curso",   ...colors.status.active },
  finished:     { label: "Finalizado", ...colors.status.finished },
  cancelled:    { label: "Cancelado",  ...colors.status.cancelled },
} as const;

export const MATCH_STATUS_META = {
  scheduled:   { label: "Programado",  ...colors.status.scheduled },
  in_progress: { label: "En vivo",     ...colors.status.in_progress },
  finished:    { label: "Finalizado",  ...colors.status.finished },
  postponed:   { label: "Postergado",  ...colors.status.postponed },
  cancelled:   { label: "Cancelado",   ...colors.status.cancelled },
} as const;
