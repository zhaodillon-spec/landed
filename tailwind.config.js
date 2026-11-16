/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        muted: "#737373",
        line: "#E8E8E8",
        canvas: "#F6F6F6",
        mist: "#F3F7FD",
        primary: {
          DEFAULT: "#0047AB",
          foreground: "#FFFFFF",
        },
        freight: "#CFCFCF",
        tax: "#B9D0F5",
        card: "#FFFFFF",
      },
      fontFamily: {
        heading: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 32px 70px -36px rgba(23, 23, 23, 0.35)",
        lift: "0 16px 32px -14px rgba(0, 71, 171, 0.75)",
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
  plugins: [],
};
