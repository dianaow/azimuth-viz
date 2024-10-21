/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    borderRadius: {
      'custom': '0.95rem',
      'custom-r': '1.25rem',
      'custom-b': '1.25rem'
    },
    extend: {
      colors: {
        'custom-dark': '#0B0B0C',
        'deep-black': '#101315'
      },
    },
  },
  plugins: [],
}

