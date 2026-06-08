/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,css}'],
  theme: {
    extend: {
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", 'system-ui', '-apple-system', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: 'var(--canvas)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        border: {
          faint: 'var(--border-faint)',
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        ink: {
          1: 'var(--ink-1)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          4: 'var(--ink-4)',
        },
        nav: {
          bg: 'var(--nav-bg)',
          border: 'var(--nav-border)',
          ink1: 'var(--nav-ink-1)',
          ink2: 'var(--nav-ink-2)',
        },
        blue: {
          DEFAULT: 'var(--blue)',
          hover: 'var(--blue-hover)',
          bg: 'var(--blue-bg)',
          mid: 'var(--blue-bg-mid)',
          border: 'var(--blue-border)',
          ink: 'var(--blue-ink)',
        },
        red: {
          DEFAULT: 'var(--red)',
          hover: 'var(--red-hover)',
          bg: 'var(--red-bg)',
          mid: 'var(--red-bg-mid)',
          border: 'var(--red-border)',
          ink: 'var(--red-ink)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          hover: 'var(--amber-hover)',
          bg: 'var(--amber-bg)',
          mid: 'var(--amber-bg-mid)',
          border: 'var(--amber-border)',
          ink: 'var(--amber-ink)',
        },
        green: {
          DEFAULT: 'var(--green)',
          bg: 'var(--green-bg)',
          border: 'var(--green-border)',
          ink: 'var(--green-ink)',
        },
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
