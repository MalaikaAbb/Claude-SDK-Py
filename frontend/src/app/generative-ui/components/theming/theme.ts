import type { GenerativeUITheme } from "@copilotkit/react-core/v2/generative-ui";

/**
 * The page's theme snippets merged into one value: the three top-level
 * variables from the provider example, and the `dark` block from the dark-mode
 * example. `mapStyle` is left out — the standard `Map` needs `maplibre-gl`,
 * which this repo does not install, so a map style would have nothing to
 * style.
 */
export const theme: GenerativeUITheme = {
  "--a2ui-color-accent": "#d97706",
  "--a2ui-font-family": "Inter, sans-serif",
  "--a2ui-radius-md": "10px",
  dark: {
    "--a2ui-color-panel": "#1f2937",
    "--a2ui-color-surface": "#111827",
  },
};
