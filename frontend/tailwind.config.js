/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    // Colores de marca - forzar generación aunque estén en ternarios
    'bg-union-navy', 'bg-union-navy-mid', 'bg-union-navy-light',
    'bg-union-red',  'bg-union-red-dark',  'bg-union-red-light',
    'text-union-navy', 'text-union-navy-mid',
    'text-union-red',  'text-union-red-dark',
    'border-union-navy', 'border-union-red',
    'from-union-navy', 'to-union-navy-mid',
    'from-union-red',  'to-union-red-dark',
    'ring-union-navy', 'divide-union-navy',
    'bg-sidebar-gradient',
  ],
  theme: {
    extend: {
      colors: {
        union: {
          navy:        '#0e1d5c',
          'navy-mid':  '#162480',
          'navy-light':'#1e3099',
          red:         '#c0392b',
          'red-dark':  '#922b21',
          'red-light': '#e74c3c',
          silver:      '#bdc3c7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, #0e1d5c 0%, #162480 55%, #0e1d5c 100%)',
      },
      boxShadow: {
        'card':      '0 1px 3px 0 rgb(0 0 0 / .07), 0 1px 2px -1px rgb(0 0 0 / .04)',
        'card-md':   '0 4px 14px 0 rgb(0 0 0 / .10)',
        'glow-red':  '0 0 0 3px rgb(192 57 43 / .3)',
        'glow-navy': '0 0 0 3px rgb(14 29 92 / .2)',
      },
    },
  },
  plugins: [],
}
