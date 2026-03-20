export const atlasUi = {
  layout: {
    shell: "relative min-h-screen overflow-hidden bg-atlas-shell text-atlas-ink atlas-transition-theme",
    pageMain: "min-h-screen bg-background px-8 py-8 text-foreground",
    timelineOffset: "atlas-timeline-offset",
  },
  panels: {
    default:
      "rounded-atlas-panel border border-atlas-panel-border bg-atlas-panel p-4 shadow-atlas-panel backdrop-blur-md",
    compact:
      "rounded-atlas-compact border border-atlas-panel-border bg-atlas-panel p-4 shadow-atlas-compact backdrop-blur-md",
    detail:
      "rounded-atlas-detail border border-atlas-detail-panel-border bg-atlas-detail-panel shadow-atlas-detail backdrop-blur-md",
  },
  surfaces: {
    card: "rounded-atlas-card border border-atlas-card-border bg-atlas-card",
    interactiveCard:
      "rounded-atlas-card border border-atlas-card-border bg-atlas-card atlas-transition-surface",
    interactiveCardHover: "hover:bg-atlas-card-hover",
    strongCard:
      "rounded-atlas-detail border border-atlas-card-strong-border bg-atlas-card-strong",
    input:
      "rounded-atlas-field border border-atlas-input-border bg-atlas-input text-atlas-ink placeholder:text-atlas-soft",
    rail:
      "rounded-atlas-card border border-atlas-rail-border bg-atlas-rail text-atlas-rail-ink shadow-atlas-rail backdrop-blur-md atlas-transition-quick",
    timeline:
      "rounded-atlas-compact border border-atlas-timeline-border bg-atlas-timeline shadow-atlas-timeline backdrop-blur-xl",
    tooltip:
      "rounded-atlas-detail border border-atlas-tooltip-border bg-atlas-tooltip text-atlas-tooltip-ink shadow-atlas-tooltip backdrop-blur-md",
    pageCard:
      "rounded-atlas-card border border-atlas-page-card-border bg-atlas-page-card shadow-atlas-page-card atlas-transition-surface",
  },
  text: {
    pageTitle: "text-3xl font-bold text-atlas-ink",
    eyebrow: "text-[10px] font-semibold tracking-[0.24em] uppercase text-atlas-eyebrow",
    wideEyebrow:
      "text-[10px] font-semibold tracking-[0.34em] uppercase text-atlas-eyebrow",
    detailEyebrow:
      "text-[10px] font-semibold tracking-[0.22em] uppercase text-atlas-eyebrow",
    heading: "text-lg font-semibold text-atlas-ink",
    display: "text-[30px] font-semibold tracking-[-0.02em] text-atlas-ink",
    title: "text-2xl font-semibold leading-tight text-atlas-ink",
    label: "text-sm font-semibold text-atlas-ink",
    body: "text-sm leading-6 text-atlas-soft",
    muted: "text-sm text-atlas-muted",
    meta: "text-xs leading-5 text-atlas-muted",
    subtle: "text-xs text-atlas-soft",
    controlLabel: "text-xs font-semibold tracking-[0.14em] uppercase",
    primaryDetail:
      "text-[11px] font-semibold tracking-[0.22em] uppercase text-atlas-primary",
  },
  buttons: {
    utility:
      "flex items-center justify-center gap-2 rounded-atlas-card border border-atlas-card-border bg-atlas-secondary px-3 py-3 text-atlas-secondary-ink atlas-transition-surface hover:bg-atlas-secondary-hover hover:text-atlas-ink",
    utilityStart:
      "flex items-center justify-start gap-2 rounded-atlas-card border border-atlas-card-border bg-atlas-secondary px-5 py-3 text-atlas-secondary-ink atlas-transition-surface hover:bg-atlas-secondary-hover hover:text-atlas-ink",
    timelinePlay:
      "flex size-11 shrink-0 items-center justify-center rounded-atlas-card border border-atlas-timeline-play-border bg-atlas-timeline-play text-atlas-ink atlas-transition-quick hover:bg-atlas-timeline-play-hover",
    smallGhost:
      "rounded-atlas-detail border border-atlas-secondary-border bg-atlas-secondary px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-atlas-secondary-ink atlas-transition-surface hover:bg-atlas-secondary-hover hover:text-atlas-ink",
    solid:
      "rounded-atlas-detail bg-atlas-primary-strong px-4 py-3 text-sm font-semibold text-atlas-primary-strong-ink atlas-transition-surface hover:bg-atlas-primary-strong-hover",
    outline:
      "rounded-atlas-detail border border-atlas-secondary-border bg-atlas-secondary px-4 py-3 text-sm font-semibold text-atlas-secondary-ink atlas-transition-surface hover:bg-atlas-secondary-hover",
    pagePrimary:
      "inline-flex items-center justify-center gap-2 rounded-atlas-card bg-atlas-primary-strong px-4 py-3 text-sm font-semibold text-atlas-primary-strong-ink atlas-transition-surface hover:bg-atlas-primary-strong-hover",
  },
  chips: {
    avatar:
      "flex size-12 items-center justify-center rounded-atlas-card bg-atlas-avatar text-sm font-semibold text-atlas-avatar-ink",
    icon:
      "flex size-8 items-center justify-center rounded-atlas-field bg-atlas-avatar text-atlas-avatar-ink",
  },
  page: {
    card: "rounded-atlas-card border border-atlas-page-card-border bg-atlas-page-card p-6 shadow-atlas-page-card",
    linkCard:
      "block rounded-atlas-card border border-atlas-page-card-border bg-atlas-page-card p-4 shadow-atlas-page-card atlas-transition-surface hover:bg-atlas-page-card-hover",
    empty:
      "rounded-atlas-card border border-atlas-page-card-border bg-atlas-page-card p-6 text-sm text-atlas-muted shadow-atlas-page-card",
  },
} as const;

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
