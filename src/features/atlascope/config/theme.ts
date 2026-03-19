export type ThemeMode = "dark" | "light";

export function themeClasses(theme: ThemeMode, variants: Record<ThemeMode, string>) {
  return variants[theme];
}
