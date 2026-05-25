/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,css}'],
  safelist: [
    'bg-brand',
    'bg-brand-dark',
    'bg-brand-light',
    'bg-brand-medium',
    'bg-brand-medium-30',
    'bg-portal-surface',
    'bg-portal-ribbon',
    'bg-nav',
    'text-brand',
    'text-brand-dark',
    'border-brand',
    'border-brand-medium',
    'border-t-brand',
    'border-line',
    'border-line-secondary',
    'text-portal-muted',
    'text-portal-stat-green',
    'text-portal-stat-warn',
    'border-portal-border',
    'hover:bg-brand-dark',
    'hover:bg-brand-light',
    'hover:text-brand-dark',
  ],
  theme: {
    extend: {
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
      },
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          dark: 'var(--brand-dark)',
          light: 'var(--brand-light)',
          medium: 'var(--brand-mid)',
        },
        portal: {
          nav: 'var(--portal-nav)',
          ribbon: 'var(--portal-ribbon)',
          border: 'var(--portal-border)',
          muted: 'var(--portal-muted)',
          surface: 'var(--portal-surface)',
          'stat-green': 'var(--portal-stat-green)',
          'stat-warn': 'var(--portal-stat-warn)',
        },
        nav: 'var(--color-nav-bg)',
        line: {
          DEFAULT: 'var(--color-border-tertiary)',
          secondary: 'var(--color-border-secondary)',
        },
        surface: {
          primary: 'var(--color-background-primary)',
          secondary: 'var(--color-background-secondary)',
        },
        ink: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          faint: 'var(--color-text-faint)',
          dim: 'var(--color-text-dim)',
          footer: 'var(--color-footer-text)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-bg)',
          soft: 'var(--color-success-bg-alt)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-bg)',
          strong: 'var(--color-warning-strong)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          light: 'var(--color-danger-bg)',
          dark: 'var(--color-danger-text-dark)',
          border: 'var(--color-danger-border)',
        },
        civil: {
          light: 'var(--color-civil-bg)',
          DEFAULT: 'var(--color-civil-text)',
        },
        dmca: {
          light: 'var(--color-dmca-bg)',
          DEFAULT: 'var(--color-dmca-text)',
        },
        fisa: {
          light: 'var(--color-fisa-bg)',
          DEFAULT: 'var(--color-fisa-text)',
        },
        junior: {
          light: 'var(--color-junior-bg)',
          DEFAULT: 'var(--color-junior-text)',
        },
        warn: {
          border: 'var(--color-warn-border)',
          text: 'var(--color-warn-text)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
