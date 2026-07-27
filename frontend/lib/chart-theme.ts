export const chartColors = {
  light: {
    primary: 'oklch(0.205 0 0)',
    secondary: 'oklch(0.97 0 0)',
    muted: 'oklch(0.556 0 0)',
    success: 'oklch(0.6 0.118 184.704)',
    warning: 'oklch(0.828 0.189 84.429)',
    danger: 'oklch(0.577 0.245 27.325)',
  },
  dark: {
    primary: 'oklch(0.922 0 0)',
    secondary: 'oklch(0.269 0 0)',
    muted: 'oklch(0.708 0 0)',
    success: 'oklch(0.696 0.17 162.48)',
    warning: 'oklch(0.627 0.265 303.9)',
    danger: 'oklch(0.704 0.191 22.216)',
  },
} as const;

export type ChartColorSet = typeof chartColors.light;
