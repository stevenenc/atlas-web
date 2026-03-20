import { atlasTheme } from "@/features/atlascope/config/theme-tokens";
import type { ThemeMode } from "@/features/atlascope/config/theme-types";

function cssDeclarations(declarations: Record<string, string>) {
  return Object.entries(declarations)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");
}

function buildModeCssVariables(theme: ThemeMode) {
  const mode = atlasTheme.modes[theme];
  const severity = atlasTheme.severity;

  return cssDeclarations({
    "--atlas-background": mode.background,
    "--atlas-foreground": mode.foreground,
    "--atlas-color-shell": mode.colors.shell,
    "--atlas-color-ink": mode.colors.ink,
    "--atlas-color-muted": mode.colors.muted,
    "--atlas-color-soft": mode.colors.soft,
    "--atlas-color-eyebrow": mode.colors.eyebrow,
    "--atlas-color-panel": mode.colors.panel,
    "--atlas-color-panel-border": mode.colors.panelBorder,
    "--atlas-color-detail-panel": mode.colors.detailPanel,
    "--atlas-color-detail-panel-border": mode.colors.detailPanelBorder,
    "--atlas-color-card": mode.colors.card,
    "--atlas-color-card-border": mode.colors.cardBorder,
    "--atlas-color-card-hover": mode.colors.cardHover,
    "--atlas-color-card-strong": mode.colors.cardStrong,
    "--atlas-color-card-strong-border": mode.colors.cardStrongBorder,
    "--atlas-color-input": mode.colors.input,
    "--atlas-color-input-border": mode.colors.inputBorder,
    "--atlas-color-placeholder": mode.colors.placeholder,
    "--atlas-color-rail": mode.colors.rail,
    "--atlas-color-rail-border": mode.colors.railBorder,
    "--atlas-color-rail-hover": mode.colors.railHover,
    "--atlas-color-rail-active": mode.colors.railActive,
    "--atlas-color-rail-active-border": mode.colors.railActiveBorder,
    "--atlas-color-rail-ink": mode.colors.railInk,
    "--atlas-color-primary": mode.colors.primary,
    "--atlas-color-primary-soft": mode.colors.primarySoft,
    "--atlas-color-primary-strong": mode.colors.primaryStrong,
    "--atlas-color-primary-strong-hover": mode.colors.primaryStrongHover,
    "--atlas-color-primary-strong-ink": mode.colors.primaryStrongInk,
    "--atlas-color-secondary": mode.colors.secondary,
    "--atlas-color-secondary-border": mode.colors.secondaryBorder,
    "--atlas-color-secondary-hover": mode.colors.secondaryHover,
    "--atlas-color-secondary-ink": mode.colors.secondaryInk,
    "--atlas-color-avatar": mode.colors.avatar,
    "--atlas-color-avatar-ink": mode.colors.avatarInk,
    "--atlas-color-timeline": mode.colors.timeline,
    "--atlas-color-timeline-border": mode.colors.timelineBorder,
    "--atlas-color-timeline-track": mode.colors.timelineTrack,
    "--atlas-color-timeline-play": mode.colors.timelinePlay,
    "--atlas-color-timeline-play-border": mode.colors.timelinePlayBorder,
    "--atlas-color-timeline-play-hover": mode.colors.timelinePlayHover,
    "--atlas-color-tooltip": mode.colors.tooltip,
    "--atlas-color-tooltip-border": mode.colors.tooltipBorder,
    "--atlas-color-tooltip-ink": mode.colors.tooltipInk,
    "--atlas-color-marker-shell": mode.colors.markerShell,
    "--atlas-color-marker-border": mode.colors.markerBorder,
    "--atlas-color-trash": mode.colors.trash,
    "--atlas-color-trash-border": mode.colors.trashBorder,
    "--atlas-color-trash-ink": mode.colors.trashInk,
    "--atlas-color-trash-active": mode.colors.trashActive,
    "--atlas-color-trash-active-border": mode.colors.trashActiveBorder,
    "--atlas-color-trash-active-ink": mode.colors.trashActiveInk,
    "--atlas-color-page-card": mode.colors.pageCard,
    "--atlas-color-page-card-border": mode.colors.pageCardBorder,
    "--atlas-color-page-card-hover": mode.colors.pageCardHover,
    "--atlas-color-disabled": mode.colors.disabled,
    "--atlas-shadow-panel": mode.shadows.panel,
    "--atlas-shadow-compact": mode.shadows.compact,
    "--atlas-shadow-detail": mode.shadows.detail,
    "--atlas-shadow-rail": mode.shadows.rail,
    "--atlas-shadow-rail-active": mode.shadows.railActive,
    "--atlas-shadow-timeline": mode.shadows.timeline,
    "--atlas-shadow-bubble": mode.shadows.bubble,
    "--atlas-shadow-tooltip": mode.shadows.tooltip,
    "--atlas-shadow-marker": mode.shadows.marker,
    "--atlas-shadow-trash": mode.shadows.trash,
    "--atlas-shadow-trash-active": mode.shadows.trashActive,
    "--atlas-shadow-page-card": mode.shadows.pageCard,
    "--atlas-bg-primary-callout": mode.callouts.primary,
    "--atlas-bg-primary-callout-add": mode.callouts.primaryAdd,
    "--atlas-shadow-primary-callout-inset": mode.callouts.primaryInset,
    "--atlas-shadow-primary-callout-add-inset": mode.callouts.primaryAddInset,
    "--atlas-color-severity-critical-border": severity.Critical[theme].border,
    "--atlas-color-severity-critical-bg": severity.Critical[theme].background,
    "--atlas-color-severity-critical-text": severity.Critical[theme].text,
    "--atlas-color-severity-high-border": severity.High[theme].border,
    "--atlas-color-severity-high-bg": severity.High[theme].background,
    "--atlas-color-severity-high-text": severity.High[theme].text,
    "--atlas-color-severity-moderate-border": severity.Moderate[theme].border,
    "--atlas-color-severity-moderate-bg": severity.Moderate[theme].background,
    "--atlas-color-severity-moderate-text": severity.Moderate[theme].text,
  });
}

export const atlasThemeStyles = `
:root {
${cssDeclarations({
  "--atlas-font-sans": atlasTheme.typography.fontFamily.sans,
  "--atlas-font-mono": atlasTheme.typography.fontFamily.mono,
  "--atlas-radius-panel": atlasTheme.radius.panel,
  "--atlas-radius-compact": atlasTheme.radius.compact,
  "--atlas-radius-card": atlasTheme.radius.card,
  "--atlas-radius-field": atlasTheme.radius.field,
  "--atlas-radius-detail": atlasTheme.radius.detail,
  "--atlas-duration-theme": atlasTheme.transitions.themeDuration,
  "--atlas-duration-standard": atlasTheme.transitions.standardDuration,
  "--atlas-duration-quick": atlasTheme.transitions.quickDuration,
  "--atlas-duration-enter": atlasTheme.transitions.enterDuration,
  "--atlas-duration-exit": atlasTheme.transitions.exitDuration,
  "--atlas-ease-standard": atlasTheme.transitions.standardEasing,
  "--atlas-ease-emphasis": atlasTheme.transitions.emphasisEasing,
  "--atlas-ease-exit": atlasTheme.transitions.exitEasing,
})}
${buildModeCssVariables("light")}
}

[data-atlascope-theme="light"] {
${buildModeCssVariables("light")}
}

[data-atlascope-theme="dark"] {
${buildModeCssVariables("dark")}
}

.atlas-transition-theme {
  transition:
    background-color var(--atlas-duration-theme) var(--atlas-ease-standard),
    border-color var(--atlas-duration-theme) var(--atlas-ease-standard),
    color var(--atlas-duration-theme) var(--atlas-ease-standard),
    box-shadow var(--atlas-duration-theme) var(--atlas-ease-standard);
}

.atlas-transition-surface {
  transition:
    background-color var(--atlas-duration-standard) var(--atlas-ease-standard),
    border-color var(--atlas-duration-standard) var(--atlas-ease-standard),
    color var(--atlas-duration-standard) var(--atlas-ease-standard),
    box-shadow var(--atlas-duration-standard) var(--atlas-ease-standard);
}

.atlas-transition-quick {
  transition:
    background-color var(--atlas-duration-quick) var(--atlas-ease-standard),
    border-color var(--atlas-duration-quick) var(--atlas-ease-standard),
    color var(--atlas-duration-quick) var(--atlas-ease-standard),
    box-shadow var(--atlas-duration-quick) var(--atlas-ease-standard),
    transform var(--atlas-duration-quick) var(--atlas-ease-standard),
    opacity var(--atlas-duration-quick) var(--atlas-ease-standard);
}

.atlas-transition-panel {
  transition:
    transform var(--atlas-duration-standard) var(--atlas-ease-standard),
    opacity var(--atlas-duration-standard) var(--atlas-ease-standard),
    background-color var(--atlas-duration-standard) var(--atlas-ease-standard),
    border-color var(--atlas-duration-standard) var(--atlas-ease-standard),
    color var(--atlas-duration-standard) var(--atlas-ease-standard);
}

.atlas-action-strip {
  transition:
    opacity var(--atlas-duration-enter) var(--atlas-ease-emphasis),
    transform var(--atlas-duration-enter) var(--atlas-ease-emphasis),
    max-width var(--atlas-duration-enter) var(--atlas-ease-emphasis);
}

.atlas-primary-callout {
  border-color: color-mix(in srgb, var(--atlas-color-primary) 34%, transparent);
  background-image: var(--atlas-bg-primary-callout);
  box-shadow: inset 0 1px 0 var(--atlas-shadow-primary-callout-inset);
}

.atlas-primary-callout-add {
  border-color: color-mix(in srgb, var(--atlas-color-primary) 14%, transparent);
  background-image: var(--atlas-bg-primary-callout-add);
  box-shadow: inset 0 1px 0 var(--atlas-shadow-primary-callout-add-inset);
}

.atlas-severity-critical {
  border-color: var(--atlas-color-severity-critical-border);
  background-color: var(--atlas-color-severity-critical-bg);
  color: var(--atlas-color-severity-critical-text);
}

.atlas-severity-high {
  border-color: var(--atlas-color-severity-high-border);
  background-color: var(--atlas-color-severity-high-bg);
  color: var(--atlas-color-severity-high-text);
}

.atlas-severity-moderate {
  border-color: var(--atlas-color-severity-moderate-border);
  background-color: var(--atlas-color-severity-moderate-bg);
  color: var(--atlas-color-severity-moderate-text);
}

@media (min-width: ${atlasTheme.breakpoints.panelOffset}) {
  .atlas-timeline-offset {
    padding-right: ${atlasTheme.spacing.panelOffset};
  }
}
`;
