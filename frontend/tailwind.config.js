/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vervix Brand Colors
        'vervix-dark': '#0F1A1F',
        'vervix-cyan': '#00D9FF',
        'vervix-purple': '#8B5CF6',
        'vervix-secondary': '#1A2A35',
        'vervix-text': '#FFFFFF',
        // Primary and secondary for Tailwind integration
        primary: '#00D9FF',
        secondary: '#8B5CF6',
      },
      backgroundColor: {
        'vervix-bg': '#0F1A1F',
        'vervix-card': '#1A2A35',
      },
      textColor: {
        'vervix-text': '#FFFFFF',
      },
      borderColor: {
        'vervix-cyan': '#00D9FF',
        'vervix-purple': '#8B5CF6',
      },
      boxShadow: {
        'vervix-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'vervix-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
