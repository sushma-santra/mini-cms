/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "#EAEAEA",
        input: "#EAEAEA",
        ring: "#F2B41C",
        background: "#FFFFFF",
        foreground: "#333333",
        primary: {
          DEFAULT: "#F2B41C",
          hover: "#E0A806",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F5",
          foreground: "#333333",
        },
        destructive: {
          DEFAULT: "#FF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "#E0A806",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#333333",
        },
      },
      borderRadius: {
        'input': '6px',
        'button': '8px',
        'card': '10px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        'section': '2rem',
        'element': '1rem',
      },
    },
  },
  plugins: [],
} 