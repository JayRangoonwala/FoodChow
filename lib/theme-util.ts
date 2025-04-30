// lib/theme-utils.ts
export function applyThemeVariables(theme: { [key: string]: string }) {
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
