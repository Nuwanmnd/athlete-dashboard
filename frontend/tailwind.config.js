/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          fg: 'hsl(var(--brand-foreground))',
          ring: 'hsl(var(--brand-ring))',
        },
        base: {
          bg: 'hsl(var(--bg))',
          card: 'hsl(var(--card))',
          border: 'hsl(var(--border))',
          muted: 'hsl(var(--muted))',
          text: 'hsl(var(--text))',
          subtle: 'hsl(var(--subtle))',
        },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        card:
          '0 1px 2px rgba(16,24,40,.04), 0 4px 12px rgba(16,24,40,.06)',
      },
      spacing: {
        page: '24px',
        section: '16px',
      },
      container: {
        center: true,
        padding: '24px',
        screens: { '2xl': '1280px' },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  // Optional: keeps generated utilities even if not seen in templates
  safelist: [
    'bg-base-bg',
    'bg-base-card',
    'border-base-border',
    'text-base-text',
    'text-base-subtle',
    'bg-brand',
    'text-brand-fg',
    'ring-brand',
  ],
};
