import type { Config } from "tailwindcss";

/**
 * Tailwind theme derived from DANA FIAT 2.5 design tokens.
 * Token source paths use the misspelling `Pallete` as shipped in the
 * FIAT JSON exports (see DESIGN_SYSTEM.md §3.3). Do not "fix" it.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background / Brand — Pallete.Blue.Blue 50 (#108EE9). DANA primary.
        "dana-blue": {
          DEFAULT: "#108EE9",
          50: "#108EE9",
          60: "#0E79C6",
          10: "#E9F5FE",
        },
        // Background / Base / Primary — Pallete.Gray.Gray 10 (#F5F5F5). Page bg.
        "bg-base": "#F5F5F5",
        // Background / Base / Secondary — white. Card surface.
        "bg-card": "#FFFFFF",
        // Background / Base / Tertiary — Pallete.Slate.Slate 20. Inputs.
        "bg-input": "#F5F8FD",
        // Text / Base tokens
        "text-strong": "#313131", // Pallete.Gray.Gray 90
        "text-medium": "#727272", // Pallete.Gray.Gray 70
        "text-subtle": "#A4A4A4", // Pallete.Gray.Gray 50
        "text-disabled": "#D1D1D1", // Pallete.Gray.Gray 30
        // Outline
        "outline-base": "#EBEBEB", // Pallete.Gray.Gray 20
        // Feedback (subset)
        "feedback-success": "#00A952", // Pallete.Green.Green 60
        "feedback-error": "#FF5D55", // Pallete.Red.Red 50
        "feedback-warning": "#E0A800", // Pallete.Yellow.Yellow 60
      },
      borderRadius: {
        // Pallete.Radius Corner: XS 4, S 8, M 12, L 16, XL 20, 2XL 24
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "12px", // default card radius per FIAT screen formula
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      spacing: {
        // Pallete.Spacing 4px base grid
        "fiat-xs": "4px",
        "fiat-s": "8px",
        "fiat-m": "12px",
        "fiat-l": "16px",
        "fiat-xl": "20px",
        "fiat-2xl": "24px",
        "fiat-4xl": "32px",
        "fiat-5xl": "40px",
      },
      fontFamily: {
        // FIAT typography defaults — system stack for mass-market Android
        sans: [
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        // Section title 24-28px bold per AI Rendering Contract
        "section-title": ["26px", { lineHeight: "32px", fontWeight: "700" }],
        // Body L / M / S from Typography tokens
        "body-l": ["16px", { lineHeight: "24px" }],
        "body-m": ["14px", { lineHeight: "20px" }],
        "body-s": ["12px", { lineHeight: "16px" }],
        "caption": ["10px", { lineHeight: "14px" }],
      },
      boxShadow: {
        // Shadow/Low/Dark — soft, per FIAT card guidance
        "fiat-card": "0 1px 2px 0 rgba(4, 18, 33, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
